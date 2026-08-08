import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import TourCard from "@/components/tours/TourCard";
import { mockTours } from "@/data/mock-tours";

export default function FeaturedToursSection() {
  const featuredTours = mockTours
    .filter(
      (tour) =>
        tour.featured &&
        ["publicado", "cupos_agotados"].includes(tour.status),
    )
    .slice(0, 3);

  if (featuredTours.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#07130f] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-lime-300">
              <Compass size={18} aria-hidden="true" />
              Próximas experiencias
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Encuentra tu próxima aventura
            </h2>

            <p className="mt-5 text-base leading-8 text-white/65 sm:text-lg">
              Descubre excursiones organizadas para explorar la naturaleza,
              compartir con nuevas personas y conocer destinos inolvidables.
            </p>
          </div>

          <Link
            href="/tours"
            className="inline-flex min-h-12 w-fit touch-manipulation items-center gap-2 rounded-xl pr-3 font-extrabold text-lime-300 transition active:text-lime-200 sm:hover:gap-3 sm:hover:text-lime-200"
          >
            Ver todos los tours
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}