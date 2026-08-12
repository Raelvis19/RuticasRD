import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";

import AdminReservationsList from "@/components/admin/AdminReservationsList";
import { getAdminReservations } from "@/lib/reservations/admin";

export const metadata: Metadata = {
  title: "Reservaciones",
};

export default async function AdminReservationsPage() {
  const { reservations, error } = await getAdminReservations();

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
        Reservaciones
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
        Solicitudes y pagos
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#667a70]">
        Revisa participantes, confirma pagos y controla los cupos de cada tour.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          No pudimos cargar las reservaciones. Comprueba Supabase e inténtalo
          nuevamente.
        </div>
      ) : (
        <div className="mt-7">
          <AdminReservationsList reservations={reservations} />
        </div>
      )}
    </div>
  );
}
