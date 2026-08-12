import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, Images } from "lucide-react";

import TourImageManager from "@/components/admin/TourImageManager";
import { getAdminTourMedia } from "@/lib/tours/admin";
import { tourStatusLabels } from "@/lib/tours/options";

export const metadata: Metadata = {
  title: "Imágenes del tour",
};

export default async function TourImagesPage({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;
  const { tour, error } = await getAdminTourMedia(tourId);

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
          No pudimos cargar las imágenes del tour. Comprueba la conexión con
          Supabase e inténtalo nuevamente.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <Link
        href="/admin/tours"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#0f5132]"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Volver a tours
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
            Portada y galería
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {tour.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#667a70]">
            Administra las fotografías promocionales que utilizaremos en la
            página pública del tour.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e6f0ea] px-4 py-2 text-xs font-black text-[#0f5132]">
          <Images size={16} aria-hidden="true" />
          {tourStatusLabels[tour.status]}
        </span>
      </div>

      <div className="mt-7">
        <TourImageManager
          tourId={tour.id}
          tourTitle={tour.title}
          initialImages={tour.images}
        />
      </div>
    </div>
  );
}
