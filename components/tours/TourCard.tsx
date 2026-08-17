import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  UsersRound,
} from "lucide-react";

import { formatDop, formatTourDate } from "@/lib/format";
import type { Tour, TourDifficulty } from "@/types/tour";

interface TourCardProps {
  tour: Tour;
}

const difficultyLabels: Record<TourDifficulty, string> = {
  facil: "Fácil",
  moderada: "Moderada",
  demandante: "Demandante",
};

export default function TourCard({ tour }: TourCardProps) {
  const isSoldOut =
    tour.availableSpots <= 0 || tour.status === "agotado";

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#17392b] bg-[#0b2118] shadow-xl shadow-black/10">
      <Link
        href={`/tours/${tour.slug}`}
        className="relative block aspect-[4/3] touch-manipulation overflow-hidden"
        aria-label={`Ver detalles de ${tour.title}`}
      >
        <Image
          src={tour.coverImage}
          alt={`Vista principal del tour ${tour.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 sm:group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#0b2118] backdrop-blur">
            {difficultyLabels[tour.difficulty]}
          </span>

          {tour.featured && (
            <span className="rounded-full bg-lime-400 px-3 py-1.5 text-xs font-extrabold text-[#07130f]">
              Destacado
            </span>
          )}
        </div>

        <span
          className={`absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-xs font-bold ${
            isSoldOut
              ? "bg-red-500 text-white"
              : "bg-[#07130f]/85 text-lime-300"
          }`}
        >
          {isSoldOut
            ? "Cupos agotados"
            : `${tour.availableSpots} cupos disponibles`}
        </span>
      </Link>

      <div className="p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
          {tour.category.replaceAll("_", " ")}
        </p>

        <Link
          href={`/tours/${tour.slug}`}
          className="mt-2 block touch-manipulation rounded-lg"
        >
          <h3 className="text-2xl font-black text-white">{tour.title}</h3>
        </Link>

        <p className="mt-3 leading-7 text-white/65">{tour.shortDescription}</p>

        <div className="mt-5 space-y-3 text-sm text-white/75">
          <div className="flex items-start gap-3">
            <MapPin
              size={18}
              className="mt-0.5 shrink-0 text-lime-300"
              aria-hidden="true"
            />
            <span>
              {tour.location}, {tour.province}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays
              size={18}
              className="mt-0.5 shrink-0 text-lime-300"
              aria-hidden="true"
            />
            <span>{formatTourDate(tour.date)}</span>
          </div>

          <div className="flex items-start gap-3">
            <UsersRound
              size={18}
              className="mt-0.5 shrink-0 text-lime-300"
              aria-hidden="true"
            />
            <span>Capacidad para {tour.capacity} participantes</span>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-white/50">Desde</p>
              <p className="text-2xl font-black text-white">
                {formatDop(tour.price)}
              </p>
              <p className="text-xs text-white/45">por persona</p>
              {tour.depositAmount > 0 && (
                <p className="mt-1 text-xs font-semibold text-lime-300">
                  Reserva con {formatDop(tour.depositAmount)}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/tours/${tour.slug}`}
            className="mt-5 flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-black text-[#07130f] transition active:scale-[0.98] active:bg-lime-300 sm:hover:bg-lime-300"
          >
            Ver detalles
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
