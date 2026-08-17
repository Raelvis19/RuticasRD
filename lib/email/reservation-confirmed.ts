import "server-only";

import { siteContent } from "@/data/site-content";
import {
  sendTransactionalEmail,
  type TransactionalEmailResult,
} from "@/lib/email/resend";
import { formatDop } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type ConfirmedEmailSkipReason =
  | "not_found"
  | "not_confirmed"
  | "missing_recipient";

export type ConfirmedReservationEmailResult =
  | TransactionalEmailResult
  | { sent: false; reason: ConfirmedEmailSkipReason };

interface ConfirmedReservationTourRow {
  title: string;
  slug: string;
  location: string;
  province: string;
  meeting_point: string;
  departure_at: string;
}

interface ConfirmedReservationRow {
  reservation_code: string;
  customer_name: string;
  customer_email: string | null;
  participant_count: number;
  total_amount: number | string;
  payment_status: string;
  reservation_status: string;
  tours:
    | ConfirmedReservationTourRow
    | ConfirmedReservationTourRow[]
    | null;
  reservation_participants: Array<{
    full_name: string;
    participant_number: number | null;
  }> | null;
  payments: Array<{
    amount: number | string;
    verification_status: string;
  }> | null;
}

interface ConfirmedReservationEmailInput {
  reservationCode: string;
  customerName: string;
  customerEmail: string;
  participantNames: string[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  tour: ConfirmedReservationTourRow;
}

export async function sendConfirmedReservationEmail(
  reservationId: string,
): Promise<ConfirmedReservationEmailResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "reservation_code, customer_name, customer_email, participant_count, total_amount, payment_status, reservation_status, tours!inner(title, slug, location, province, meeting_point, departure_at), reservation_participants(full_name, participant_number), payments(amount, verification_status)",
    )
    .eq("id", reservationId)
    .maybeSingle();

  if (error || !data) {
    console.error(
      `[reservation-confirmed-email] Could not load reservation ${reservationId}:`,
      error,
    );
    return { sent: false, reason: "not_found" };
  }

  const row = data as unknown as ConfirmedReservationRow;
  if (row.reservation_status !== "confirmada") {
    return { sent: false, reason: "not_confirmed" };
  }

  const customerEmail = row.customer_email?.trim().toLowerCase();
  if (!customerEmail) {
    console.error(
      `[reservation-confirmed-email] ${row.reservation_code} has no recipient email.`,
    );
    return { sent: false, reason: "missing_recipient" };
  }

  const tour = Array.isArray(row.tours) ? row.tours[0] : row.tours;
  if (!tour) return { sent: false, reason: "not_found" };

  const participantNames = [...(row.reservation_participants ?? [])]
    .sort(
      (first, second) =>
        (first.participant_number ?? Number.MAX_SAFE_INTEGER) -
        (second.participant_number ?? Number.MAX_SAFE_INTEGER),
    )
    .map((participant) => participant.full_name);
  const paidAmount = (row.payments ?? [])
    .filter((payment) => payment.verification_status === "verificado")
    .reduce((total, payment) => total + Number(payment.amount), 0);
  const input: ConfirmedReservationEmailInput = {
    reservationCode: row.reservation_code,
    customerName: row.customer_name,
    customerEmail,
    participantNames,
    totalAmount: Number(row.total_amount),
    paidAmount,
    paymentStatus: row.payment_status,
    tour,
  };

  return sendTransactionalEmail({
    idempotencyKey: `reservation-confirmed-${row.reservation_code}`,
    to: customerEmail,
    subject: `¡Tu cupo está confirmado! ${row.reservation_code} | Ruticas RD`,
    html: createConfirmedEmailHtml(input),
    text: createConfirmedEmailText(input),
  });
}

function createConfirmedEmailHtml(input: ConfirmedReservationEmailInput) {
  const balance = Math.max(0, input.totalAmount - input.paidAmount);
  const confirmationUrl = getSiteUrl(
    `/reserva/confirmacion/${encodeURIComponent(input.reservationCode)}`,
  );
  const whatsappUrl = `https://wa.me/${siteContent.contact.whatsapp}?text=${encodeURIComponent(
    `Hola Ruticas RD, necesito ayuda con la reservación confirmada ${input.reservationCode}.`,
  )}`;
  const participantsHtml = input.participantNames
    .map(
      (name, index) =>
        `<li style="margin-top:${index === 0 ? "0" : "8px"};">Participante ${index + 1}: <strong>${escapeHtml(name)}</strong></li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(input.reservationCode)} confirmada | Ruticas RD</title>
  </head>
  <body style="margin:0;background:#edf5f0;color:#14231c;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu cupo para ${escapeHtml(input.tour.title)} está confirmado.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf5f0;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 32px rgba(7,19,15,.08);">
            <tr>
              <td style="background:#07130f;padding:28px 32px;text-align:center;">
                <img src="${escapeHtml(getSiteUrl("/images/brand/logo-ruticas-white.png"))}" width="150" alt="Ruticas RD" style="display:inline-block;max-width:150px;height:auto;border:0;">
                <p style="margin:10px 0 0;color:#bef264;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Explora. Conecta. Vive.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="border:1px solid #b8e0c6;border-radius:20px;background:#eaf8ef;padding:24px;text-align:center;">
                  <p style="margin:0;color:#0f5132;font-size:13px;font-weight:900;letter-spacing:.11em;text-transform:uppercase;">Pago verificado</p>
                  <h1 style="margin:10px 0 8px;color:#0b3d26;font-size:30px;line-height:1.2;">¡Tu cupo está confirmado!</h1>
                  <p style="margin:0;color:#3f6653;font-size:15px;line-height:1.6;">Ya formas parte de esta aventura con Ruticas RD.</p>
                </div>

                <p style="margin:24px 0 0;color:#61746b;font-size:16px;line-height:1.7;">Hola, <strong style="color:#14231c;">${escapeHtml(input.customerName)}</strong>. Verificamos tu pago o abono y reservamos oficialmente ${input.participantNames.length === 1 ? "tu cupo" : "los cupos de tu grupo"}.</p>

                <div style="margin:24px 0;background:#07130f;border-radius:18px;padding:22px;text-align:center;">
                  <p style="margin:0;color:#a8b5ae;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Código de reservación</p>
                  <p style="margin:8px 0 0;color:#bef264;font-size:28px;font-weight:900;letter-spacing:.06em;">${escapeHtml(input.reservationCode)}</p>
                </div>

                ${sectionTitle("Detalles del tour")}
                <div style="border:1px solid #dce5df;border-radius:16px;padding:18px;background:#f8faf9;">
                  ${detailRow("Tour", input.tour.title)}
                  ${detailRow("Destino", `${input.tour.location}, ${input.tour.province}`)}
                  ${detailRow("Fecha y hora", formatDominicanDateTime(input.tour.departure_at))}
                  ${detailRow("Punto de encuentro", input.tour.meeting_point)}
                  ${detailRow("Cupos confirmados", String(input.participantNames.length), true)}
                </div>

                ${sectionTitle(input.participantNames.length === 1 ? "Participante confirmado" : "Participantes confirmados")}
                <div style="border:1px solid #dce5df;border-radius:16px;padding:18px;background:#f8faf9;color:#40564c;font-size:14px;line-height:1.6;">
                  <ol style="margin:0;padding-left:22px;">${participantsHtml}</ol>
                </div>

                ${sectionTitle("Resumen del pago")}
                <div style="border:1px solid #dce5df;border-radius:16px;padding:18px;background:#f8faf9;">
                  ${detailRow("Total de la reservación", formatDop(input.totalAmount))}
                  ${detailRow("Pago verificado", formatDop(input.paidAmount), true)}
                  ${detailRow("Estado", input.paymentStatus === "pagado" ? "Pago completado" : "Abono confirmado")}
                  ${detailRow("Saldo pendiente", formatDop(balance), balance > 0)}
                </div>

                ${
                  balance > 0
                    ? `<div style="margin-top:20px;border:1px solid #f5d690;border-radius:16px;background:#fff8e7;padding:16px;color:#7a5212;font-size:14px;line-height:1.6;"><strong>Tu cupo ya está confirmado.</strong> Recuerda completar el saldo antes de la fecha límite indicada por Ruticas RD.</div>`
                    : `<div style="margin-top:20px;border:1px solid #b8e0c6;border-radius:16px;background:#eaf8ef;padding:16px;color:#24563b;font-size:14px;line-height:1.6;"><strong>Reservación pagada completamente.</strong> No tienes saldo pendiente.</div>`
                }

                <div style="margin-top:28px;text-align:center;">
                  <a href="${escapeHtml(confirmationUrl)}" style="display:inline-block;border-radius:999px;background:#0f5132;color:#ffffff;padding:15px 24px;text-decoration:none;font-size:15px;font-weight:800;">Consultar mi reservación</a>
                </div>

                <div style="margin-top:28px;border-radius:16px;background:#edf5f0;padding:18px;color:#3f5b4e;font-size:14px;line-height:1.65;">
                  <strong style="color:#0f5132;">Este es un correo automático.</strong><br>
                  No respondas a este mensaje. Si necesitas ayuda, <a href="${escapeHtml(whatsappUrl)}" style="color:#0f5132;font-weight:800;">comunícate con Ruticas RD por WhatsApp</a>.
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f5f8f6;padding:22px 32px;text-align:center;color:#71827a;font-size:12px;line-height:1.6;">
                Ruticas RD · ${escapeHtml(siteContent.contact.location)}<br>
                Conserva este correo y tu código de reservación para el día de la excursión.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function createConfirmedEmailText(input: ConfirmedReservationEmailInput) {
  const balance = Math.max(0, input.totalAmount - input.paidAmount);
  const participantList = input.participantNames
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n");

  return `RUTICAS RD — ¡TU CUPO ESTÁ CONFIRMADO!

Hola, ${input.customerName}.

Verificamos tu pago o abono y confirmamos oficialmente tu reservación.

Código de reservación: ${input.reservationCode}

DETALLES DEL TOUR
Tour: ${input.tour.title}
Destino: ${input.tour.location}, ${input.tour.province}
Fecha y hora: ${formatDominicanDateTime(input.tour.departure_at)}
Punto de encuentro: ${input.tour.meeting_point}
Cupos confirmados: ${input.participantNames.length}

PARTICIPANTES CONFIRMADOS
${participantList}

RESUMEN DEL PAGO
Total de la reservación: ${formatDop(input.totalAmount)}
Pago verificado: ${formatDop(input.paidAmount)}
Estado: ${input.paymentStatus === "pagado" ? "Pago completado" : "Abono confirmado"}
Saldo pendiente: ${formatDop(balance)}

${balance > 0 ? "Tu cupo está confirmado. Recuerda completar el saldo antes de la fecha límite indicada por Ruticas RD." : "La reservación está pagada completamente."}

Consulta tu reservación:
${getSiteUrl(`/reserva/confirmacion/${encodeURIComponent(input.reservationCode)}`)}

ESTE ES UN CORREO AUTOMÁTICO. NO RESPONDAS A ESTE MENSAJE.
Si necesitas ayuda, comunícate con Ruticas RD por WhatsApp: https://wa.me/${siteContent.contact.whatsapp}
`;
}

function sectionTitle(value: string) {
  return `<h2 style="margin:28px 0 12px;color:#14231c;font-size:19px;line-height:1.3;">${escapeHtml(value)}</h2>`;
}

function detailRow(label: string, value: string, highlighted = false) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
      <td style="padding:7px 8px 7px 0;color:#71827a;font-size:13px;line-height:1.45;vertical-align:top;">${escapeHtml(label)}</td>
      <td align="right" style="padding:7px 0 7px 8px;color:${highlighted ? "#0f5132" : "#14231c"};font-size:13px;font-weight:800;line-height:1.45;vertical-align:top;">${escapeHtml(value || "—")}</td>
    </tr>
  </table>`;
}

function formatDominicanDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Santo_Domingo",
  }).format(date);
}

function getSiteUrl(path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = configuredUrl || "https://ruticasrd.com";

  try {
    return new URL(
      path,
      baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
    ).toString();
  } catch {
    return `https://ruticasrd.com${path}`;
  }
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
