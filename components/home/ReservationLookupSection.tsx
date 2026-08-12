"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  LoaderCircle,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import {
  lookupReservationAction,
  type ReservationLookupState,
} from "@/app/reserva/actions";
import { formatDop, formatTourDate } from "@/lib/format";
import {
  paymentStatusLabels,
  reservationStatusLabels,
} from "@/lib/reservations/options";

const initialState: ReservationLookupState = {};

export default function ReservationLookupSection() {
  const [state, action, pending] = useActionState(
    lookupReservationAction,
    initialState,
  );

  return (
    <section
      id="consultar-reserva"
      className="scroll-mt-24 bg-[#eef4f0] px-4 py-14 text-[#14231c] sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0f5132] text-lime-300">
            <CalendarCheck size={25} />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
            Mi reservación
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Consulta el estado con tu código
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-[#60746b]">
            No necesitas crear una cuenta. Pega el código recibido al completar
            tu solicitud y revisa si el pago y los cupos ya fueron confirmados.
          </p>
          <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#60746b]">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#0f5132]" />
            La consulta no muestra documentos, teléfonos ni datos privados de
            los participantes.
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#d4e0d9] bg-white p-5 shadow-sm sm:p-7">
          <form action={action}>
            <label htmlFor="reservation-code" className="text-sm font-black">
              Código de reservación
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="reservation-code"
                name="reservation_code"
                required
                maxLength={17}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="RUT-2026-XXXXXXXX"
                className="min-h-14 min-w-0 flex-1 rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 font-bold uppercase tracking-wide outline-none placeholder:font-normal placeholder:tracking-normal focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10"
              />
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-lime-400 px-6 font-black text-[#07130f] disabled:cursor-wait disabled:opacity-65"
              >
                {pending ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
                {pending ? "Consultando..." : "Consultar"}
              </button>
            </div>
          </form>

          {state.message && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              {state.message}
            </div>
          )}

          {state.reservation && (
            <div className="mt-6 rounded-3xl bg-[#07130f] p-5 text-white sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-lime-400 px-3 py-1.5 text-xs font-black text-[#07130f]">
                  {reservationStatusLabels[state.reservation.reservationStatus]}
                </span>
                <span className="text-xs font-black tracking-wide text-lime-300">
                  {state.reservation.code}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-black">
                {state.reservation.tourTitle}
              </h3>
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <Result label="Fecha" value={formatTourDate(state.reservation.tourDate)} />
                <Result
                  label="Participantes"
                  value={String(state.reservation.participantCount)}
                  icon={<UsersRound size={17} />}
                />
                <Result
                  label="Estado del pago"
                  value={paymentStatusLabels[state.reservation.paymentStatus]}
                />
                <Result
                  label="Abono requerido"
                  value={formatDop(state.reservation.requiredDeposit)}
                />
              </div>
              {state.reservation.tourSlug && (
                <Link
                  href={`/tours/${state.reservation.tourSlug}`}
                  className="mt-6 inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm font-black text-lime-300"
                >
                  Ver información del tour
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Result({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-white/50">
        {icon} {label}
      </p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
