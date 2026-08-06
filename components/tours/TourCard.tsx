import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  UsersRound,
} from "lucide-react";

import type { Tour, TourDifficulty } from "@/types/tour";

interface TourCardProps {
  tour: Tour;
}

const difficultyLabels: Record<TourDifficulty, string> = {
  facil: "Fácil",
  moderada: "Moderada",
  demandante: "Demandante",
};

function formatTourDate(date: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function TourCard({ tour }: TourCardProps) {
  const isSoldOut =
    tour.availableSpots <= 0 || tour.status === "cupos_agotados";

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#17392b] bg-[#0b2118] shadow-xl shadow-black/10">
      <Link
        href={`/tours/${tour.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <Image
          src={tour.coverImage}
          alt={`Vista principal del tour ${tour.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
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

      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
          {tour.category.replaceAll("_", " ")}
        </p>

        <h3 className="mt-2 text-2xl font-black text-white">
          {tour.title}
        </h3>

        <p className="mt-3 leading-7 text-white/65">
          {tour.shortDescription}
        </p>

        <div className="mt-5 space-y-3 text-sm text-white/75">
          <div className="flex items-center gap-3">
            <MapPin
              size={18}
              className="shrink-0 text-lime-300"
              aria-hidden="true"
            />
            <span>
              {tour.location}, {tour.province}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays
              size={18}
              className="shrink-0 text-lime-300"
              aria-hidden="true"
            />
            <span className="capitalize">{formatTourDate(tour.date)}</span>
          </div>

          <div className="flex items-center gap-3">
            <UsersRound
              size={18}
              className="shrink-0 text-lime-300"
              aria-hidden="true"
            />
            <span>Capacidad para {tour.capacity} participantes</span>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs text-white/50">Desde</p>
            <p className="text-2xl font-black text-white">
              {formatPrice(tour.price)}
            </p>
            <p className="text-xs text-white/45">por persona</p>
          </div>

          <Link
            href={`/tours/${tour.slug}`}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-[#07130f] transition hover:-translate-y-1 hover:bg-lime-300"
            aria-label={`Ver detalles de ${tour.title}`}
          >
            <ArrowUpRight size={21} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}