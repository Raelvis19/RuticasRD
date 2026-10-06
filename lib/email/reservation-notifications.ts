import "server-only";

import {
  sendReservationConfirmationEmail,
  type ReservationConfirmationEmailInput,
} from "@/lib/email/reservation-confirmation";
import {
  sendTransactionalEmail,
  type TransactionalEmailResult,
} from "@/lib/email/resend";
import { formatDop, formatLongTourDate } from "@/lib/format";

// Both emails are awaited independently. A notification failure must never turn
// an already committed reservation into an apparent booking failure.
export async function sendReservationNotifications(
  input: ReservationConfirmationEmailInput,
): Promise<TransactionalEmailResult> {
  const [customer, admin] = await Promise.allSettled([
    Promise.resolve().then(() => sendReservationConfirmationEmail(input)),
    Promise.resolve().then(() => sendAdminReservationNotification(input)),
  ]);
  if (admin.status === "rejected") {
    console.error(
      `[admin-email] Unexpected notification failure for ${input.reservationCode}.`,
    );
  }
  if (customer.status === "rejected") {
    console.error(
      `[email] Unexpected customer notification failure for ${input.reservationCode}.`,
    );
    return { sent: false, reason: "provider_error" };
  }
  // The public emailSent flag continues to describe only the customer's email.
  return customer.value;
}

export async function sendAdminReservationNotification(
  input: ReservationConfirmationEmailInput,
): Promise<TransactionalEmailResult> {
  const recipient = process.env.RESERVATION_ADMIN_EMAIL?.trim();
  if (
    !recipient ||
    recipient.length > 254 ||
    !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipient)
  ) {
    console.error(
      `[admin-email] RESERVATION_ADMIN_EMAIL is missing or invalid; notification for ${input.reservationCode} was skipped.`,
    );
    return { sent: false, reason: "not_configured" };
  }

  let panelUrl: string;
  try {
    const site = new URL(
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.ruticasrd.com",
    );
    if (!["https:", "http:"].includes(site.protocol))
      throw new Error("Invalid site protocol");
    panelUrl = new URL("/admin/reservaciones", site).toString();
  } catch {
    panelUrl = "https://www.ruticasrd.com/admin/reservaciones";
  }

  const rows: [string, string][] = [
    ["Código", input.reservationCode],
    ["Excursión", input.tour.title],
    ["Fecha", formatLongTourDate(input.tour.date)],
    ["Responsable", input.customer.fullName],
    ["Correo", input.customer.email],
    ["Teléfono", input.customer.phone],
    ["Participantes", String(input.participants.length)],
    ["Subtotal", formatDop(input.pricing.originalAmount)],
    ["Descuento", formatDop(input.pricing.discountAmount)],
    ["Código de descuento", input.pricing.discountCode || "Sin descuento"],
    ["Total", formatDop(input.pricing.totalAmount)],
    ["Abono requerido", formatDop(input.pricing.requiredDeposit)],
    ["Estado", "Pendiente de verificación"],
  ];
  const instruction =
    input.pricing.totalAmount === 0 && input.pricing.discountAmount > 0
      ? "Premio gratuito: revisa el premio y la disponibilidad antes de confirmar. No requiere registrar un pago."
      : "Revisa la solicitud y verifica el pago o abono antes de confirmar los cupos.";
  const result = await sendTransactionalEmail({
    idempotencyKey: `reservation-admin-${input.reservationCode}`,
    to: recipient,
    subject: `Nueva reservación: ${input.reservationCode} | Ruticas RD`,
    timeoutMs: 8000,
    text: `NUEVA RESERVACIÓN — RUTICAS RD\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${instruction}\n\nAbre el panel y busca el código: ${panelUrl}`,
    html: `<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body style="margin:0;background:#edf5f0;font-family:Arial,sans-serif;color:#14231c;padding:24px 12px"><div style="max-width:620px;margin:auto;background:white;border-radius:20px;padding:28px"><h1 style="font-size:24px;color:#0f5132">Nueva reservación</h1><p>Recibiste una nueva solicitud en Ruticas RD.</p><table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th scope="row" style="text-align:left;padding:10px 8px;border-bottom:1px solid #dce5df;font-size:14px">${escapeHtml(label)}</th><td style="padding:10px 8px;border-bottom:1px solid #dce5df;font-size:14px;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="line-height:1.6">${escapeHtml(instruction)}</p><p><a href="${escapeHtml(panelUrl)}" style="display:inline-block;background:#0f5132;color:white;padding:14px 20px;border-radius:24px;text-decoration:none">Abrir reservaciones</a></p><p style="font-size:13px;color:#61746b">Inicia sesión en el panel y busca el código de esta reserva para ver los detalles.</p></div></body></html>`,
  });
  if (!result.sent)
    console.error(
      `[admin-email] Notification for ${input.reservationCode} failed (${result.reason}).`,
    );
  return result;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}
