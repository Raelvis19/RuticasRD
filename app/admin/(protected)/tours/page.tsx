import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertCircle,
  CalendarDays,
  Images,
  MapPin,
  Pencil,
  Printer,
  Plus,
  Star,
  UsersRound,
} from "lucide-react";

import { formatDop } from "@/lib/format";
import { getAdminTours } from "@/lib/tours/admin";
import {
  tourCategoryLabels,
  tourDifficultyLabels,
  tourStatusLabels,
} from "@/lib/tours/options";
import type { TourStatus } from "@/types/tour";

const statusStyles: Record<TourStatus, string> = {
  borrador: "bg-amber-100 text-amber-800",
  publicado: "bg-emerald-100 text-emerald-800",
  agotado: "bg-orange-100 text-orange-800",
  finalizado: "bg-slate-200 text-slate-700",
  cancelado: "bg-red-100 text-red-800",
  pospuesto: "bg-violet-100 text-violet-800",
};

interface AdminToursPageProps {
  searchParams: Promise<{ created?: string; updated?: string }>;
}

export default async function AdminToursPage({
  searchParams,
}: AdminToursPageProps) {
  const [{ tours, error }, params] = await Promise.all([
    getAdminTours(),
    searchParams,
  ]);
  const publishedCount = tours.filter((tour) => tour.status === "publicado").length;
  const draftCount = tours.filter((tour) => tour.status === "borrador").length;

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
            Tours
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Administración de tours
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#667a70]">
            Crea y consulta las excursiones guardadas en Supabase.
          </p>
        </div>

        <Link
          href="/admin/tours/nuevo"
          className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-[#0f5132] px-6 py-3 font-black text-white shadow-lg shadow-[#0f5132]/15 transition active:scale-[0.98] sm:w-auto sm:hover:bg-[#0b4027]"
        >
          <Plus size={19} aria-hidden="true" />
          Crear nuevo tour
        </Link>
      </div>

      {params.created === "1" && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800"
        >
          El tour se guardó correctamente en Supabase.
        </div>
      )}

      {params.updated === "1" && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800"
        >
          Los cambios del tour se guardaron correctamente.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          No pudimos cargar los tours. Comprueba la conexión con Supabase e
          inténtalo nuevamente.
        </div>
      )}

      {!error && (
        <div className="mt-7 grid grid-cols-3 gap-3">
          <StatCard label="Total" value={tours.length} />
          <StatCard label="Publicados" value={publishedCount} />
          <StatCard label="Borradores" value={draftCount} />
        </div>
      )}

      {!error && tours.length === 0 && (
        <section className="mt-7 rounded-[2rem] border border-dashed border-[#bdcec4] bg-white px-5 py-12 text-center sm:px-8 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]">
            <CalendarDays size={26} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-black">Todavía no hay tours reales</h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#667a70]">
            El tour de demostración aún vive en el código. Crea aquí la primera
            excursión que se guardará en Supabase.
          </p>
          <Link
            href="/admin/tours/nuevo"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-lime-400 px-6 py-3 font-black text-[#07130f] transition active:scale-[0.98] sm:hover:bg-lime-300"
          >
            Crear el primer tour
          </Link>
        </section>
      )}

      {tours.length > 0 && (
        <div className="mt-7 grid gap-4 xl:grid-cols-2">
          {tours.map((tour) => (
            <article
              key={tour.id}
              className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${statusStyles[tour.status]}`}
                >
                  {tourStatusLabels[tour.status]}
                </span>
                <span className="rounded-full bg-[#edf3ef] px-3 py-1.5 text-xs font-bold text-[#496057]">
                  {tourCategoryLabels[tour.category]}
                </span>
                {tour.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-black text-lime-800">
                    <Star size={13} fill="currentColor" /> Destacado
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-xl font-black sm:text-2xl">{tour.title}</h2>
              <p className="mt-1 break-all text-xs text-[#82938a]">/{tour.slug}</p>

              <div className="mt-5 grid gap-3 text-sm text-[#52675e] sm:grid-cols-2">
                <InfoRow icon={MapPin}>
                  {tour.location}, {tour.province}
                </InfoRow>
                <InfoRow icon={CalendarDays}>
                  {formatTourDate(tour.departureAt)}
                </InfoRow>
                <InfoRow icon={UsersRound}>
                  {tour.occupiedSpots}/{tour.capacity} ocupados ·{" "}
                  {tour.availableSpots} disponibles
                </InfoRow>
                <div>
                  <p className="font-black text-[#14231c]">{formatDop(tour.price)}</p>
                  <p className="mt-0.5 text-xs">
                    Abono: {formatDop(tour.depositAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#e3ebe6] pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71847a]">
                  Dificultad: {tourDifficultyLabels[tour.difficulty]}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Link
                    href={`/admin/tours/${tour.id}/editar`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0f5132] px-4 text-sm font-black text-white transition active:scale-[0.98] sm:hover:bg-[#0b4027]"
                  >
                    <Pencil size={17} aria-hidden="true" />
                    Editar tour
                  </Link>
                  <Link
                    href={`/admin/tours/${tour.id}/imagenes`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#c9d8cf] px-4 text-sm font-black text-[#0f5132] transition active:scale-[0.98] sm:hover:bg-[#f1f6f3]"
                  >
                    <Images size={17} aria-hidden="true" />
                    Administrar imágenes
                  </Link>
                  <Link
                    href={`/admin/tours/${tour.id}/asistencia`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#c9d8cf] px-4 text-sm font-black text-[#0f5132] transition active:scale-[0.98] sm:hover:bg-[#f1f6f3]"
                  >
                    <Printer size={17} aria-hidden="true" />
                    Imprimir listado
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#dce6e0] bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-bold text-[#71847a]">{label}</p>
      <p className="mt-1 text-2xl font-black sm:text-3xl">{value}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={17} className="mt-0.5 shrink-0 text-[#0f5132]" />
      <span className="leading-5">{children}</span>
    </div>
  );
}

function formatTourDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santo_Domingo",
  }).format(new Date(value));
}
