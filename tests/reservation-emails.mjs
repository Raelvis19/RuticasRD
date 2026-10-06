import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Load the real server modules with controlled dependencies. No network request
// or environment file is read by these tests.
function load(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => {
      if (name === "server-only") return {};
      if (!(name in dependencies))
        throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

const originalFetch = globalThis.fetch;
const originalError = console.error;
const keys = [
  "RESEND_API_KEY",
  "RESERVATION_ADMIN_EMAIL",
  "RESERVATION_EMAIL_FROM",
  "NEXT_PUBLIC_SITE_URL",
];
const originalEnv = Object.fromEntries(
  keys.map((key) => [key, process.env[key]]),
);
const logs = [];
const requests = [];
let providerStatus = 200;
let customerThrows = false;
let customerSent = true;
let customerCalls = 0;
try {
  console.error = (...args) => logs.push(args.join(" "));
  process.env.RESEND_API_KEY = "re_test_fake";
  process.env.RESERVATION_ADMIN_EMAIL = "ruticasrd@yahoo.com";
  process.env.RESERVATION_EMAIL_FROM = "Test <no-responder@example.com>";
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.ruticasrd.com";
  globalThis.fetch = async (url, options) => {
    requests.push({ url, ...options, body: JSON.parse(options.body) });
    return new Response("{}", { status: providerStatus });
  };
  const resend = load("../lib/email/resend.ts", {});
  const notifications = load("../lib/email/reservation-notifications.ts", {
    "@/lib/email/resend": resend,
    "@/lib/email/reservation-confirmation": {
      sendReservationConfirmationEmail: async () => {
        customerCalls++;
        if (customerThrows) throw new Error("Simulated customer failure");
        return customerSent
          ? { sent: true }
          : { sent: false, reason: "provider_error" };
      },
    },
    "@/lib/format": {
      formatDop: (value) => `RD$${value}`,
      formatLongTourDate: (value) => value,
    },
  });
  const input = {
    reservationCode: "RUT-2026-ABCDEF12",
    customer: {
      fullName: '<img src=x onerror="alert(1)">',
      email: "customer@example.com",
      phone: "123",
      documentNumber: "PRIVATE_DOCUMENT",
    },
    participants: [{ emergencyPhone: "PRIVATE_EMERGENCY" }],
    tour: { title: "Excursión & prueba", date: "2026-11-01" },
    pricing: {
      originalAmount: 2500,
      discountAmount: 500,
      totalAmount: 2000,
      requiredDeposit: 500,
      discountCode: "PREMIO500",
    },
  };
  assert.equal(
    (await notifications.sendReservationNotifications(input)).sent,
    true,
  );
  assert.equal(customerCalls, 1);
  assert.equal(requests.length, 1);
  const request = requests[0];
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.deepEqual(request.body.to, ["ruticasrd@yahoo.com"]);
  assert.equal(
    request.headers["Idempotency-Key"],
    "reservation-admin-RUT-2026-ABCDEF12",
  );
  assert.ok(request.signal instanceof AbortSignal);
  assert.match(request.body.html, /&lt;img/);
  assert.doesNotMatch(request.body.html, /<img src=x/);
  assert.doesNotMatch(
    JSON.stringify(request.body),
    /PRIVATE_DOCUMENT|PRIVATE_EMERGENCY/,
  );
  assert.match(request.body.text, /Total: RD\$2000/);
  assert.match(
    request.body.html,
    /https:\/\/www.ruticasrd.com\/admin\/reservaciones/,
  );
  providerStatus = 503;
  assert.equal(
    (await notifications.sendReservationNotifications(input)).sent,
    true,
  );
  assert.ok(
    logs.some(
      (line) => line.includes("[admin-email]") && line.includes("failed"),
    ),
  );
  globalThis.fetch = async () => {
    throw new DOMException("Timed out", "TimeoutError");
  };
  assert.equal(
    (await notifications.sendReservationNotifications(input)).sent,
    true,
  );
  const before = requests.length;
  delete process.env.RESERVATION_ADMIN_EMAIL;
  assert.equal(
    (await notifications.sendReservationNotifications(input)).sent,
    true,
  );
  process.env.RESERVATION_ADMIN_EMAIL = "one@example.com,two@example.com";
  assert.equal(
    (await notifications.sendReservationNotifications(input)).sent,
    true,
  );
  assert.equal(requests.length, before);
  process.env.RESERVATION_ADMIN_EMAIL = "ruticasrd@yahoo.com";
  globalThis.fetch = async (url, options) => {
    requests.push({ body: JSON.parse(options.body) });
    return new Response("{}", { status: 200 });
  };
  customerThrows = true;
  assert.equal(
    (await notifications.sendReservationNotifications(input)).sent,
    false,
  );
  assert.equal(requests.length, before + 1); // Admin still receives an attempt if client email throws.
  customerThrows = false;
  customerSent = false;
  assert.equal(
    (await notifications.sendReservationNotifications(input)).sent,
    false,
  );
  const free = {
    ...input,
    pricing: {
      ...input.pricing,
      discountAmount: 2500,
      totalAmount: 0,
      requiredDeposit: 0,
    },
  };
  await notifications.sendAdminReservationNotification(free);
  assert.match(requests.at(-1).body.text, /Premio gratuito/);
  assert.match(requests.at(-1).body.text, /Total: RD\$0/);
  console.log(
    "PASS: admin recipient, payload, escaping, discount totals, free prizes, timeout and independent customer/admin failures.",
  );
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  for (const key of keys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
}
