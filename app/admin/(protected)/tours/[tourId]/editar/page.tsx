import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

import TourForm from "@/components/admin/TourForm";
import { getAdminTourEditor } from "@/lib/tours/admin";

export const metadata: Metadata = {
  title: "Editar tour",
};

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;
  const { tour, error } = await getAdminTourEditor(tourId);

  if (!tour && !error) notFound();

  if (error || !tour) {
    return (
      <div>
        <Link
          href="/admin/tours"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#0f5132]"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Volver a tours
        </Link>
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          No pudimos cargar la información del tour. Comprueba la conexión con
          Supabase e inténtalo nuevamente.
        </div>
      </div>
    );
  }

  return <TourForm mode="edit" tourId={tour.id} initialValues={tour.values} />;
}
