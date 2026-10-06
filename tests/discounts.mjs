import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);`);
const migrations = [
  "001_initial_schema.sql",
  "migrations/202608120001_harden_admin_access.sql",
  "migrations/202608120004_public_tours_and_reservations.sql",
  "migrations/202608120005_reservation_management.sql",
  "migrations/202608150001_tour_capacity_and_statuses.sql",
  "migrations/202608150002_reservation_participant_order.sql",
  "migrations/202608150003_payments_and_receipts.sql",
  "migrations/202610060001_discount_codes.sql",
];
for (const m of migrations) {
  await db.exec(
    readFileSync(root + "supabase/" + m, "utf8").replace(
      "create extension if not exists pgcrypto;",
      "",
    ),
  );
  console.log("Migration OK:", m);
}
const admin = "10000000-0000-4000-8000-000000000001";
await db.exec(
  `insert into auth.users values('${admin}'); insert into profiles(id,full_name,role) values('${admin}','Test admin','admin'); select set_config('request.jwt.claim.sub','${admin}',false);`,
);
const tour = async (slug, capacity = 50) =>
  (
    await db.query(
      `insert into tours(slug,title,short_description,description,category,difficulty,location,province,meeting_point,departure_at,price,deposit_amount,reservation_deadline,capacity,status) values($1,$1,'test','test','playa','facil','test','test','test',now()+interval '30 days',2500,500,now()+interval '20 days',$2,'publicado') returning id`,
      [slug, capacity],
    )
  ).rows[0].id;
const t = await tour("discount-test");
const other = await tour("other");
const save = async (
  code,
  kind = "fixed",
  amount = 500,
  uses = 1,
  email = null,
  expiry = null,
  active = true,
) =>
  db.query(`select admin_save_discount(null,$1,$2,$3,$4,$5,$6,$7,$8)`, [
    code,
    t,
    kind,
    amount,
    uses,
    expiry,
    email,
    active,
  ]);
const preview = async (code, n = 1, email = "winner@example.com", tid = t) =>
  (
    await db.query(`select preview_reservation_discount($1,$2,$3,$4) as q`, [
      tid,
      code,
      n,
      email,
    ])
  ).rows[0].q;
let serial = 0;
const reserve = async (code, n = 1, tid = t, invalid = false) => {
  serial++;
  const customer = {
    fullName: "Test Winner",
    documentNumber: "TEST",
    phone: "test-" + serial,
    email: "winner@example.com",
    city: "test",
  };
  const participants = Array.from({ length: n }, () => ({
    fullName: invalid ? "" : "Test participant",
    documentNumber: "TEST",
    city: "test",
    emergencyName: "Test contact",
    emergencyPhone: "TEST",
    isMinor: false,
  }));
  return (
    await db.query("select create_discounted_reservation($1,$2,$3,$4) as q", [
      tid,
      JSON.stringify(customer),
      JSON.stringify(participants),
      code,
    ])
  ).rows[0].q;
};
const rejected = async (fn, pattern) => {
  await assert.rejects(fn, pattern);
};
await save("FIXED500");
assert.deepEqual(await preview("fixed500", 3), {
  originalAmount: 7500,
  discountAmount: 500,
  totalAmount: 7000,
  requiredDeposit: 1500,
  discountCode: "FIXED500",
  discountKind: "fixed",
});
await save("FREESEAT", "free_seat", 0, 5);
assert.equal((await preview("FREESEAT", 3)).totalAmount, 5000);
assert.equal((await preview("FREESEAT", 3)).requiredDeposit, 1000);
assert.equal((await preview("FREESEAT")).totalAmount, 0);
assert.equal((await preview("FREESEAT")).requiredDeposit, 0);
await save("BIGPRIZE", "fixed", 9000);
assert.equal((await preview("BIGPRIZE")).discountAmount, 2500);
await save("SMALLBALANCE", "fixed", 2200);
assert.equal((await preview("SMALLBALANCE")).requiredDeposit, 300);
await save("EXPIRED", "fixed", 500, 1, null, "2000-01-01");
await save("INACTIVE", "fixed", 500, 1, null, null, false);
await save("EMAILONLY", "fixed", 500, 1, "winner@example.com");
for (const code of ["EXPIRED", "INACTIVE", "MISSING"])
  await rejected(() => preview(code), /discount_unavailable/);
await rejected(
  () => preview("EMAILONLY", 1, "other@example.com"),
  /discount_unavailable/,
);
await rejected(
  () => preview("FIXED500", 1, "winner@example.com", other),
  /discount_unavailable/,
);
await rejected(() => preview("FIXED500", 0), /invalid_participant_count/);
await rejected(() => reserve("FIXED500", 1, t, true), /incomplete_participant/);
assert.equal((await preview("FIXED500")).discountAmount, 500); // Failed reservations do not consume uses.
const fixed = await reserve("FIXED500", 3);
assert.equal(fixed.totalAmount, 7000);
await rejected(() => reserve("FIXED500"), /discount_unavailable/);
const free = await reserve("FREESEAT");
const row = (
  await db.query("select * from reservations where reservation_code=$1", [
    free.code,
  ])
).rows[0];
assert.equal(row.reservation_status, "pendiente_verificacion");
assert.equal(row.payment_status, "sin_pago");
await db.query(
  "select admin_update_reservation($1,'confirmada','sin_pago','Premio revisado')",
  [row.id],
);
const confirmed = (
  await db.query("select * from reservations where id=$1", [row.id])
).rows[0];
assert.match(confirmed.admin_notes, /Premio gratuito confirmado/);
assert.equal(confirmed.payment_status, "sin_pago");
await rejected(
  () =>
    db.query(
      "insert into payments(reservation_id,amount,method,verification_status,verified_by,verified_at) values($1,1,'efectivo','verificado',auth.uid(),now())",
      [row.id],
    ),
  /payment_exceeds_reservation_balance/,
);
await rejected(
  () => db.query("select admin_release_discount($1)", [row.id]),
  /discount_release_requires_cancellation/,
);
await db.query(
  "select admin_update_reservation($1,'cancelada','sin_pago',null)",
  [row.id],
);
await db.query("select admin_release_discount($1)", [row.id]);
await rejected(
  () =>
    db.query(
      "select admin_update_reservation($1,'confirmada','sin_pago',null)",
      [row.id],
    ),
  /discount_released_reservation/,
);
const normal = await reserve(null);
assert.equal(normal.totalAmount, 2500);
assert.equal(normal.requiredDeposit, 500);
const status = (
  await db.query("select get_public_reservation_status($1) as q", [fixed.code])
).rows[0].q;
assert.equal(status.totalAmount, 7000);
assert.equal(status.discountAmount, 500);
assert.equal(status.originalAmount, 7500);
assert.equal(status.discountCode, undefined);
assert.equal(status.customer_email, undefined);
await db.exec(
  "select set_config('request.jwt.claim.sub','',false); set role anon;",
);
await rejected(
  () => db.query("select * from discount_codes"),
  /permission denied/,
);
await rejected(
  () => db.query("select admin_release_discount($1)", [row.id]),
  /permission denied/,
);
await preview("FREESEAT"); // The public RPC works under the anonymous role.
await db.exec("reset role; set role authenticated;");
await rejected(() => save("UNAUTHORIZED"), /administrator_access_required/);
assert.equal((await db.query("select * from discount_codes")).rows.length, 0);
await db.exec(
  `reset role; select set_config('request.jwt.claim.sub','${admin}',false);`,
);
// Paid group uses the discounted deposit and total; confirmed seats still count in capacity.
const fixedId = (
  await db.query("select id from reservations where reservation_code=$1", [
    fixed.code,
  ])
).rows[0].id;
await db.query(
  "insert into payments(reservation_id,amount,method,verification_status,verified_by,verified_at) values($1,1500,'efectivo','verificado',auth.uid(),now())",
  [fixedId],
);
assert.equal(
  (
    await db.query("select reservation_status from reservations where id=$1", [
      fixedId,
    ])
  ).rows[0].reservation_status,
  "confirmada",
);
await rejected(
  () =>
    db.query(
      "insert into payments(reservation_id,amount,method,verification_status,verified_by,verified_at) values($1,5501,'efectivo','verificado',auth.uid(),now())",
      [fixedId],
    ),
  /payment_exceeds_reservation_balance/,
);
// Used rewards cannot be rewritten, but activation and limits remain editable.
const fixedDiscount = (
  await db.query("select id from discount_codes where code='FIXED500'")
).rows[0].id;
await rejected(
  () =>
    db.query(
      "select admin_save_discount($1,'FIXED500',$2,'fixed',1000,1,null,null,true)",
      [fixedDiscount, t],
    ),
  /discount_already_used/,
);
await rejected(
  () =>
    db.query(
      "select admin_save_discount($1,'FIXED500',$2,'fixed',500,0,null,null,true)",
      [fixedDiscount, t],
    ),
  /discount_limit_below_usage/,
);
await db.query(
  "select admin_save_discount($1,'FIXED500',$2,'fixed',500,1,null,null,false)",
  [fixedDiscount, t],
);
assert.equal(
  (
    await db.query("select total_amount from reservations where id=$1", [
      fixedId,
    ])
  ).rows[0].total_amount,
  "7000.00",
);
// Cancellation alone does not free a one-use code. Explicit release does.
await save("REUSABLE");
const firstUse = await reserve("REUSABLE");
const firstId = (
  await db.query("select id from reservations where reservation_code=$1", [
    firstUse.code,
  ])
).rows[0].id;
await db.query(
  "select admin_update_reservation($1,'cancelada','sin_pago',null)",
  [firstId],
);
await rejected(() => reserve("REUSABLE"), /discount_unavailable/);
await db.query("select admin_release_discount($1)", [firstId]);
const secondUse = await reserve("REUSABLE");
assert.equal(secondUse.discountAmount, 500);
assert.notEqual(secondUse.code, firstUse.code);
assert.equal(
  (
    await db.query("select discount_amount from reservations where id=$1", [
      firstId,
    ])
  ).rows[0].discount_amount,
  "500.00",
);

// Exhaust capacity after a prize was requested; confirming it must still fail.
const waiting = await reserve("FREESEAT");
const waitingId = (
  await db.query("select id from reservations where reservation_code=$1", [
    waiting.code,
  ])
).rows[0].id;
await db.query("update tours set capacity=3 where id=$1", [t]);
await rejected(
  () =>
    db.query(
      "select admin_update_reservation($1,'confirmada','sin_pago',null)",
      [waitingId],
    ),
  /insufficient_spots/,
);
console.log(
  "PASS: discount amounts, deposits, eligibility, usage, rollback, RLS, free confirmation, release, paid totals and capacity.",
);
await db.close();
