import {
  Compass,
  MapPin,
  TreePine,
  UsersRound,
} from "lucide-react";

import ToursCatalog from "@/components/tours/ToursCatalog";
import { mockTours } from "@/data/mock-tours";

export const metadata = {
  title: "Tours y excursiones",
  description:
    "Descubre las próximas excursiones, aventuras y experiencias organizadas por Ruticas RD en República Dominicana.",
};

export default function ToursPage() {
  const publishedTours = mockTours.filter(
    (tour) =>
      tour.status === "publicado" ||
      tour.status === "cupos_agotados",
  );

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#07130f] px-4 pb-14 nav-offset text-white sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        {/* Decoración */}
        <div className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.16em] text-lime-300">
              <Compass size={18} />
              Explora República Dominicana
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Tu próxima historia
              <span className="block text-lime-300">
                comienza aquí.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Senderos, montañas, cascadas, playas y
              destinos únicos organizados para que solo
              tengas que preocuparte por disfrutar la
              experiencia.
            </p>
          </div>

          {/* Mini estadísticas */}
          <div className="mt-8 grid max-w-4xl gap-3 sm:mt-12 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <TreePine className="text-lime-300" size={23} />

              <p className="mt-4 text-xl font-black">
                Naturaleza
              </p>

              <p className="mt-1 text-sm text-white/50">
                Destinos únicos del país
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <UsersRound className="text-lime-300" size={23} />

              <p className="mt-4 text-xl font-black">
                Comunidad
              </p>

              <p className="mt-1 text-sm text-white/50">
                Aventuras para compartir
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <MapPin className="text-lime-300" size={23} />

              <p className="mt-4 text-xl font-black">
                RD
              </p>

              <p className="mt-1 text-sm text-white/50">
                Explora nuestro país
              </p>
            </div>
          </div>
        </div>
      </section>

      <ToursCatalog tours={publishedTours} />
    </main>
  );
}