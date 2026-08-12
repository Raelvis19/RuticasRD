"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Search,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { formatDop } from "@/lib/format";
import type { AdminReservationListItem } from "@/lib/reservations/admin";
import {
  paymentStatusLabels,
  reservationStatusLabels,
  reservationStatusOptions,
  type ReservationStatus,
} from "@/lib/reservations/options";

interface AdminReservationsListProps {
  reservations: AdminReservationListItem[];
}

type StatusFilter = "todas" | ReservationStatus;

const reservationStatusStyles: Record<ReservationStatus, string> = {
  pendiente_verificacion: "bg-amber-100 text-amber-800",
  confirmada: "bg-emerald-100 text-emerald-800",
  lista_espera: "bg-blue-100 text-blue-800",
  cancelada: "bg-red-100 text-red-800",
  completada: "bg-slate-200 text-slate-700",
};

export default function AdminReservationsList({
  reservations,
}: AdminReservationsListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todas");

  const filteredReservations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return reservations.filter((reservation) => {
      const matchesSearch =
        !normalizedSearch ||
        reservation.code.toLowerCase().includes(normalizedSearch) ||
        reservation.customerName.toLowerCase().includes(normalizedSearch) ||
        reservation.customerPhone.toLowerCase().includes(normalizedSearch) ||
        reservation.tourTitle.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        status === "todas" || reservation.reservationStatus === status;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, status]);

  const pendingCount = reservations.filter(
    (reservation) => reservation.reservationStatus === "pendiente_verificacion",
  ).length;
  const confirmedParticipants = reservations
    .filter((reservation) =>
      ["confirmada", "completada"].includes(reservation.reservationStatus),
    )
    .reduce((total, reservation) => total + reservation.participantCount, 0);
  const verifiedAmount = reservations
    .filter((reservation) =>
      ["abono", "pagado"].includes(reservation.paymentStatus),
    )
    .reduce((total, reservation) => {
      return (
        total +
        (reservation.paymentStatus === "pagado"
          ? reservation.totalAmount
          : reservation.requiredDeposit)
      );
    }, 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Solicitudes" value={String(reservations.length)} />
        <Stat label="Pendientes" value={String(pendingCount)} emphasized />
        <Stat
          label="Cupos confirmados"
          value={String(confirmedParticipants)}
        />
        <Stat label="Monto verificado" value={formatDop(verifiedAmount)} compact />
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[#dce6e0] bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_15rem]">
          <label className="relative block">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#71847a]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar código, nombre, teléfono o tour..."
              aria-label="Buscar reservaciones"
              className="min-h-13 w-full rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] pl-11 pr-4 text-base outline-none focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="min-h-13 rounded-2xl border border-[#d5e1da] bg-[#f9fbfa] px-4 font-bold text-[#294238] outline-none focus:border-[#0f5132]"
          >
            <option value="todas">Todos los estados</option>
            {reservationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {(search || status !== "todas") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("todas");
            }}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-red-700"
          >
            <X size={16} /> Limpiar filtros
          </button>
        )}
      </div>

      {filteredReservations.length > 0 ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filteredReservations.map((reservation) => (
            <article
              key={reservation.id}
              className="rounded-[1.5rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${reservationStatusStyles[reservation.reservationStatus]}`}
                >
                  {reservationStatusLabels[reservation.reservationStatus]}
                </span>
                <span className="text-xs font-black tracking-wide text-[#0f5132]">
                  {reservation.code}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-black">{reservation.customerName}</h2>
              <p className="mt-1 text-sm text-[#667a70]">{reservation.customerPhone}</p>

              <div className="mt-5 space-y-3 text-sm text-[#52675e]">
                <Info icon={ClipboardList}>{reservation.tourTitle}</Info>
                <Info icon={CalendarDays}>
                  {formatDate(reservation.tourDate)}
                </Info>
                <Info icon={UsersRound}>
                  {reservation.participantCount}{" "}
                  {reservation.participantCount === 1
                    ? "participante"
                    : "participantes"}
                </Info>
                <Info icon={CircleDollarSign}>
                  {paymentStatusLabels[reservation.paymentStatus]} · Total{" "}
                  {formatDop(reservation.totalAmount)}
                </Info>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#e3ebe6] pt-4">
                <p className="text-xs text-[#82938a]">
                  Recibida {formatDateTime(reservation.createdAt)}
                </p>
                <Link
                  href={`/admin/reservaciones/${reservation.id}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-[#0f5132] px-4 text-sm font-black text-white"
                >
                  Revisar <ChevronRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#bdcec4] bg-white px-5 py-12 text-center">
          <ClipboardList size={32} className="mx-auto text-[#71847a]" />
          <h2 className="mt-4 text-xl font-black">No hay resultados</h2>
          <p className="mt-2 text-sm text-[#71847a]">
            Cambia los filtros o espera una nueva solicitud.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasized = false,
  compact = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
        emphasized
          ? "border-amber-200 bg-amber-50"
          : "border-[#dce6e0] bg-white"
      }`}
    >
      <p className="text-xs font-bold text-[#71847a]">{label}</p>
      <p className={`mt-1 font-black ${compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}>
        {value}
      </p>
    </div>
  );
}

function Info({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={17} className="mt-0.5 shrink-0 text-[#0f5132]" />
      <span className="leading-5">{children}</span>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeZone: "America/Santo_Domingo",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Santo_Domingo",
  }).format(new Date(value));
}
