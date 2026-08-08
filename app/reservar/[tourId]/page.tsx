import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import ReservationClient from "@/components/reservations/ReservationClient";
import { mockTours } from "@/data/mock-tours";

interface ReservationPageProps {
  params: Promise<{
    tourId: string;
  }>;
}

export default async function ReservationPage({ params }: ReservationPageProps) {
  const { tourId } = await params;
  const tour = mockTours.find((currentTour) => currentTour.id === tourId);

  if (!tour) notFound();

  if (tour.availableSpots <= 0 || tour.status === "cupos_agotados") {
    return (
      <main className="min-h-screen bg-[#f4f7f5] px-4 pb-24 nav-offset text-[#14231c] sm:px-6">
        <section className="mx-auto max-w-xl rounded-[1.5rem] bg-white p-6 text-center shadow-sm sm:rounded-3xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f5132] sm:text-sm">
            Ruticas RD
          </p>
          <h1 className="mt-4 text-2xl font-black sm:text-3xl">
            Esta aventura está completa
          </h1>
          <p className="mt-4 leading-7 text-[#61746b]">
            Los cupos de esta excursión ya se agotaron. Muy pronto
            habilitaremos la lista de espera.
          </p>
          <Link
            href={`/tours/${tour.slug}`}
            className="mt-7 inline-flex min-h-14 touch-manipulation items-center gap-2 rounded-full bg-[#0f5132] px-6 py-3 font-black text-white active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Volver al tour
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 pb-24 nav-offset text-[#14231c] sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 max-w-6xl sm:mb-8">
        <Link
          href={`/tours/${tour.slug}`}
          className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-xl pr-3 text-sm font-bold text-[#60746b] transition active:bg-white/70 active:text-[#0f5132] sm:hover:text-[#0f5132]"
        >
          <ArrowLeft size={18} />
          <span className="line-clamp-1">Volver a {tour.title}</span>
        </Link>
      </div>

      <ReservationClient tour={tour} />
    </main>
  );
}
