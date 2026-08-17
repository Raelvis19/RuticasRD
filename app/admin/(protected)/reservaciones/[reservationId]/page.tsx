import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import ReservationUpdateForm from "@/components/admin/ReservationUpdateForm";
import PaymentManager from "@/components/admin/PaymentManager";
import { formatDop } from "@/lib/format";
import { getAdminReservationDetail } from "@/lib/reservations/admin";
import {
  paymentStatusLabels,
  reservationStatusLabels,
} from "@/lib/reservations/options";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Detalle de reservación",
};

export default async function AdminReservationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reservationId: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  const [{ reservationId }, query] = await Promise.all([params, searchParams]);
  const { reservation, error } = await getAdminReservationDetail(reservationId);

  if (!reservation && !error) notFound();

  if (error || !reservation) {
    return (
      <div>
        <BackLink />
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          No pudimos cargar la reservación. Comprueba Supabase e inténtalo
          nuevamente.
        </div>
      </div>
    );
  }

  const customerWhatsApp = createWhatsAppUrl(
    reservation.customerPhone,
    `Hola ${reservation.customerName}, te contactamos de Ruticas RD sobre tu reservación ${reservation.code}.`,
  );

  return (
    <div className="pb-12">
      <BackLink />

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
            {reservation.code}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {reservation.customerName}
          </h1>
          <p className="mt-3 text-[#667a70]">{reservation.tourTitle}</p>
        </div>
        {customerWhatsApp && (
          <a
            href={customerWhatsApp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 font-black text-[#07130f]"
          >
            <MessageCircle size={19} /> Contactar por WhatsApp
          </a>
        )}
      </div>

      {query.updated === "1" && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800"
        >
          La reservación se actualizó correctamente. Los cupos públicos ya
          reflejan este cambio.
        </div>
      )}

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-black">Estado e importes</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Summary
                icon={CalendarDays}
                label="Reservación"
                value={reservationStatusLabels[reservation.reservationStatus]}
              />
              <Summary
                icon={CircleDollarSign}
                label="Pago"
                value={paymentStatusLabels[reservation.paymentStatus]}
              />
              <Summary
                icon={UsersRound}
                label="Participantes"
                value={String(reservation.participantCount)}
              />
              <Summary
                icon={CircleDollarSign}
                label="Total"
                value={formatDop(reservation.totalAmount)}
              />
              <Summary
                icon={CircleDollarSign}
                label="Precio por persona"
                value={formatDop(reservation.pricePerPerson)}
              />
              <Summary
                icon={CircleDollarSign}
                label="Abono requerido"
                value={formatDop(reservation.requiredDeposit)}
              />
              <Summary
                icon={CalendarDays}
                label="Solicitud recibida"
                value={formatDateTime(reservation.createdAt)}
              />
              <Summary
                icon={CalendarDays}
                label="Fecha del tour"
                value={formatDateTime(reservation.tourDate)}
              />
            </div>
            {reservation.tourSlug && (
              <Link
                href={`/tours/${reservation.tourSlug}`}
                target="_blank"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cad9d0] px-4 text-sm font-black text-[#0f5132]"
              >
                Ver tour público <ExternalLink size={16} />
              </Link>
            )}
          </section>

          {reservation.customerNotes && (
            <section className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black">Notas del cliente</h2>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-[#52675e]">
                {reservation.customerNotes}
              </p>
            </section>
          )}

          <section className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-black">Persona responsable</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Summary icon={UserRound} label="Nombre" value={reservation.customerName} />
              <Summary
                icon={UserRound}
                label="Documento"
                value={`${documentLabel(reservation.customerDocumentType)} ${reservation.customerDocumentNumber}`}
              />
              <Summary icon={Phone} label="Teléfono" value={reservation.customerPhone} />
              <Summary
                icon={Mail}
                label="Correo"
                value={reservation.customerEmail || "No proporcionado"}
              />
              <Summary icon={MapPin} label="Ciudad" value={reservation.customerCity} />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-black">Participantes</h2>
              <p className="mt-1 text-sm text-[#71847a]">
                Datos privados visibles únicamente para administración.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {reservation.participants.map((participant, index) => (
                <article
                  key={participant.id}
                  className="rounded-[1.5rem] border border-[#dce6e0] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#0f5132]">
                        Participante {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-black">
                        {participant.fullName}
                      </h3>
                    </div>
                    {participant.isMinor && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                        Menor
                      </span>
                    )}
                  </div>
                  <dl className="mt-5 space-y-3 text-sm">
                    <DetailRow
                      label="Documento"
                      value={`${documentLabel(participant.documentType)} ${participant.documentNumber}`}
                    />
                    <DetailRow label="Ciudad" value={participant.city} />
                    <DetailRow
                      label="Emergencia"
                      value={`${participant.emergencyName} · ${participant.emergencyPhone}`}
                    />
                    {participant.isMinor && (
                      <DetailRow label="Tutor" value={participant.guardianName} />
                    )}
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <PaymentManager
            reservationId={reservation.id}
            payments={reservation.payments}
            paidAmount={reservation.paidAmount}
            balanceAmount={reservation.balanceAmount}
          />
        </div>

        <div>
          <div className="xl:sticky xl:top-24">
            <ReservationUpdateForm
              reservationId={reservation.id}
              initialReservationStatus={reservation.reservationStatus}
              initialPaymentStatus={reservation.paymentStatus}
              initialAdminNotes={reservation.adminNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/reservaciones"
      className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#0f5132]"
    >
      <ArrowLeft size={18} /> Volver a reservaciones
    </Link>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#f6f9f7] p-4">
      <Icon size={19} className="mt-0.5 shrink-0 text-[#0f5132]" />
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#71847a]">{label}</p>
        <p className="mt-1 break-words font-black">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[#71847a]">{label}</dt>
      <dd className="min-w-0 break-words text-right font-bold">{value}</dd>
    </div>
  );
}

function documentLabel(value: string) {
  if (value === "cedula") return "Cédula:";
  if (value === "pasaporte") return "Pasaporte:";
  return "Documento:";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santo_Domingo",
  }).format(new Date(value));
}
