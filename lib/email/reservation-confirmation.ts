import "server-only";

import { siteContent } from "@/data/site-content";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { formatDop, formatLongTourDate } from "@/lib/format";

interface ReservationEmailCustomer {
  fullName: string;
  documentNumber: string;
  phone: string;
  email: string;
  city: string;
}

interface ReservationEmailParticipant {
  fullName: string;
  documentNumber: string;
  city: string;
  emergencyName: string;
  emergencyPhone: string;
  isMinor: boolean;
  guardianName: string;
}

interface ReservationEmailTour {
  title: string;
  location: string;
  province: string;
  meetingPoint: string;
  date: string;
  departureTime: string;
  price: number;
  depositAmount: number;
}

export interface ReservationConfirmationEmailInput {
  reservationCode: string;
  customer: ReservationEmailCustomer;
  participants: ReservationEmailParticipant[];
  tour: ReservationEmailTour;
}

export async function sendReservationConfirmationEmail(
  input: ReservationConfirmationEmailInput,
) {
  const subject = `Reservación recibida: ${input.reservationCode} | Ruticas RD`;

  return sendTransactionalEmail({
    idempotencyKey: `reservation-requested-${input.reservationCode}`,
    to: input.customer.email,
    subject,
    html: createReservationEmailHtml(input),
    text: createReservationEmailText(input),
  });
}

function createReservationEmailHtml(input: ReservationConfirmationEmailInput) {
  const { customer, participants, reservationCode, tour } = input;
  const participantCount = participants.length;
  const totalAmount = tour.price * participantCount;
  const requiredDeposit = tour.depositAmount * participantCount;
  const confirmationUrl = getSiteUrl(
    `/reserva/confirmacion/${encodeURIComponent(reservationCode)}`,
  );
  const whatsappUrl = `https://wa.me/${siteContent.contact.whatsapp}?text=${encodeURIComponent(
    `Hola Ruticas RD, necesito ayuda con la reservación ${reservationCode}.`,
  )}`;

  const participantsHtml = participants
    .map(
      (participant, index) => `
        <div style="margin-top:${index === 0 ? "0" : "16px"};border:1px solid #dce5df;border-radius:16px;padding:18px;background:#f8faf9;">
          <p style="margin:0 0 12px;color:#0f5132;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;">Participante ${index + 1}</p>
          ${detailRow("Nombre", participant.fullName)}
          ${detailRow("Cédula o documento", participant.documentNumber)}
          ${detailRow("Ciudad", participant.city)}
          ${detailRow("Contacto de emergencia", participant.emergencyName)}
          ${detailRow("Teléfono de emergencia", participant.emergencyPhone)}
          ${detailRow("Menor de edad", participant.isMinor ? "Sí" : "No")}
          ${participant.isMinor ? detailRow("Padre, madre o tutor", participant.guardianName) : ""}
        </div>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(reservationCode)} | Ruticas RD</title>
  </head>
  <body style="margin:0;background:#edf5f0;color:#14231c;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Recibimos tu solicitud. Conserva el código ${escapeHtml(reservationCode)}.</div>
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
                <p style="margin:0;color:#0f5132;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Solicitud recibida</p>
                <h1 style="margin:10px 0 12px;font-size:28px;line-height:1.2;color:#14231c;">Hola, ${escapeHtml(customer.fullName)}</h1>
                <p style="margin:0;color:#61746b;font-size:16px;line-height:1.7;">Registramos tu solicitud de reservación. Guarda el siguiente código, porque lo necesitarás para consultar el estado y enviar el comprobante de pago.</p>

                <div style="margin:24px 0;background:#07130f;border-radius:18px;padding:22px;text-align:center;">
                  <p style="margin:0;color:#a8b5ae;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Código de reservación</p>
                  <p style="margin:8px 0 0;color:#bef264;font-size:28px;font-weight:900;letter-spacing:.06em;">${escapeHtml(reservationCode)}</p>
                </div>

                <div style="margin-bottom:28px;border:1px solid #f5d690;border-radius:16px;background:#fff8e7;padding:16px;color:#7a5212;font-size:14px;line-height:1.6;">
                  <strong>Tu cupo aún no está confirmado.</strong> La solicitud no descuenta disponibilidad hasta que Ruticas RD verifique el pago o abono requerido.
                </div>

                ${sectionTitle("Información del tour")}
                <div style="border:1px solid #dce5df;border-radius:16px;padding:18px;background:#f8faf9;">
                  ${detailRow("Tour", tour.title)}
                  ${detailRow("Destino", `${tour.location}, ${tour.province}`)}
                  ${detailRow("Fecha", formatLongTourDate(tour.date))}
                  ${detailRow("Hora de salida", formatTime(tour.departureTime))}
                  ${detailRow("Punto de encuentro", tour.meetingPoint)}
                  ${detailRow("Participantes", String(participantCount))}
                  ${detailRow("Precio por persona", formatDop(tour.price))}
                  ${detailRow("Total", formatDop(totalAmount), true)}
                  ${detailRow("Abono requerido", formatDop(requiredDeposit), true)}
                  ${detailRow("Estado", "Pendiente de verificación")}
                </div>

                ${sectionTitle("Persona responsable")}
                <div style="border:1px solid #dce5df;border-radius:16px;padding:18px;background:#f8faf9;">
                  ${detailRow("Nombre", customer.fullName)}
                  ${detailRow("Cédula o documento", customer.documentNumber)}
                  ${detailRow("Teléfono / WhatsApp", customer.phone)}
                  ${detailRow("Correo electrónico", customer.email)}
                  ${detailRow("Ciudad", customer.city)}
                </div>

                ${sectionTitle(participantCount === 1 ? "Participante" : "Participantes")}
                ${participantsHtml}

                <div style="margin-top:28px;text-align:center;">
                  <a href="${escapeHtml(confirmationUrl)}" style="display:inline-block;border-radius:999px;background:#0f5132;color:#ffffff;padding:15px 24px;text-decoration:none;font-size:15px;font-weight:800;">Ver reservación e instrucciones de pago</a>
                </div>

                <div style="margin-top:28px;border-radius:16px;background:#edf5f0;padding:18px;color:#3f5b4e;font-size:14px;line-height:1.65;">
                  <strong style="color:#0f5132;">Este es un correo automático.</strong><br>
                  No respondas ni envíes comprobantes a este correo. Si necesitas ayuda, <a href="${escapeHtml(whatsappUrl)}" style="color:#0f5132;font-weight:800;">comunícate con Ruticas RD por WhatsApp</a>.
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f5f8f6;padding:22px 32px;text-align:center;color:#71827a;font-size:12px;line-height:1.6;">
                Ruticas RD · ${escapeHtml(siteContent.contact.location)}<br>
                Recibiste este mensaje porque usaron esta dirección para solicitar una reservación en www.ruticasrd.com.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function createReservationEmailText(input: ReservationConfirmationEmailInput) {
  const { customer, participants, reservationCode, tour } = input;
  const participantCount = participants.length;
  const totalAmount = tour.price * participantCount;
  const requiredDeposit = tour.depositAmount * participantCount;
  const participantDetails = participants
    .map(
      (participant, index) => `
PARTICIPANTE ${index + 1}
Nombre: ${participant.fullName}
Cédula o documento: ${participant.documentNumber}
Ciudad: ${participant.city}
Contacto de emergencia: ${participant.emergencyName}
Teléfono de emergencia: ${participant.emergencyPhone}
Menor de edad: ${participant.isMinor ? "Sí" : "No"}${
        participant.isMinor ? `\nPadre, madre o tutor: ${participant.guardianName}` : ""
      }`,
    )
    .join("\n");

  return `RUTICAS RD — SOLICITUD DE RESERVACIÓN RECIBIDA

Hola, ${customer.fullName}.

Código de reservación: ${reservationCode}

Tu cupo aún no está confirmado. La solicitud no descuenta disponibilidad hasta que Ruticas RD verifique el pago o abono requerido.

INFORMACIÓN DEL TOUR
Tour: ${tour.title}
Destino: ${tour.location}, ${tour.province}
Fecha: ${formatLongTourDate(tour.date)}
Hora de salida: ${formatTime(tour.departureTime)}
Punto de encuentro: ${tour.meetingPoint}
Participantes: ${participantCount}
Precio por persona: ${formatDop(tour.price)}
Total: ${formatDop(totalAmount)}
Abono requerido: ${formatDop(requiredDeposit)}
Estado: Pendiente de verificación

PERSONA RESPONSABLE
Nombre: ${customer.fullName}
Cédula o documento: ${customer.documentNumber}
Teléfono / WhatsApp: ${customer.phone}
Correo electrónico: ${customer.email}
Ciudad: ${customer.city}
${participantDetails}

Consulta la reservación y las instrucciones de pago:
${getSiteUrl(`/reserva/confirmacion/${encodeURIComponent(reservationCode)}`)}

ESTE ES UN CORREO AUTOMÁTICO. NO RESPONDAS NI ENVÍES COMPROBANTES A ESTE CORREO.
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

function formatTime(value: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;

  const hour = Number(match[1]);
  const minute = match[2];
  if (!Number.isInteger(hour) || hour > 23) return value;

  const period = hour >= 12 ? "p. m." : "a. m.";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

function getSiteUrl(path: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = configuredUrl || "https://www.ruticasrd.com";

  try {
    return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
  } catch {
    return `https://www.ruticasrd.com${path}`;
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
