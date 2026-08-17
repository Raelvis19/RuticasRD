import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  Backpack,
  Bus,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  MapPin,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";

import { formatDop, formatLongTourDate } from "@/lib/format";
import { getPublicTourBySlug } from "@/lib/tours/public";
import type {
  TourCategory,
  TourDifficulty,
  TourStatus,
} from "@/types/tour";

import { notFound } from "next/navigation";

interface TourPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const difficultyLabels: Record<TourDifficulty, string> = {
  facil: "Fácil",
  moderada: "Moderada",
  demandante: "Demandante",
};

const categoryLabels: Record<TourCategory, string> = {
  senderismo: "Senderismo",
  balneario: "Balneario",
  cascada: "Cascada",
  montana: "Montaña",
  parque_nacional: "Parque nacional",
  playa: "Playa",
  ecologico: "Destino ecológico",
  turistico: "Destino turístico",
};

export async function generateMetadata({
  params,
}: TourPageProps): Promise<Metadata> {
  const { slug } = await params;

  const tour = await getPublicTourBySlug(slug);

  if (!tour) {
    return {
      title: "Tour no encontrado",
    };
  }

  return {
    title: tour.title,
    description: tour.shortDescription,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      type: "website",
      url: `/tours/${tour.slug}`,
      title: `${tour.title} | Ruticas RD`,
      description: tour.shortDescription,
      images: [
        {
          url: tour.coverImage,
          alt: `${tour.title} en ${tour.location}, República Dominicana`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tour.title} | Ruticas RD`,
      description: tour.shortDescription,
      images: [tour.coverImage],
    },
  };
}

export default async function TourDetailPage({
  params,
}: TourPageProps) {
  const { slug } = await params;

  const tour = await getPublicTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  const bookedSpots = Math.max(
    tour.capacity - tour.availableSpots,
    0,
  );

  const occupancyPercentage =
    tour.capacity > 0
      ? Math.min(
          Math.round(
            (bookedSpots / tour.capacity) * 100,
          ),
          100,
        )
      : 0;

  const isSoldOut =
    tour.availableSpots <= 0 ||
    tour.status === "agotado";

  const isLowAvailability =
    !isSoldOut &&
    tour.availableSpots <= 5;

  const galleryImages = [
    tour.coverImage,
    ...tour.images,
  ].slice(0, 3);

  const reservationHref = isSoldOut
    ? `/reservar/${tour.id}?modo=espera`
    : `/reservar/${tour.id}`;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: tour.title,
    description: tour.shortDescription,
    image: [tour.coverImage, ...tour.images].map(absoluteUrl),
    startDate: `${tour.date}T${tour.departureTime}:00-04:00`,
    eventStatus: eventStatus(tour.status),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: tour.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: tour.location,
        addressRegion: tour.province,
        addressCountry: "DO",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Ruticas RD",
      url: "https://ruticasrd.com",
    },
    offers: {
      "@type": "Offer",
      url: `https://ruticasrd.com/tours/${tour.slug}`,
      price: tour.price,
      priceCurrency: "DOP",
      validFrom: tour.createdAt,
      availability: isSoldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

  return (
    <main className="min-h-screen bg-[#f4f7f5] pb-36 text-[#14231c] lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* =========================================
          HEADER DEL TOUR
      ========================================= */}

      <section className="bg-[#07130f] px-4 pb-10 nav-offset text-white sm:px-6 sm:pb-12 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-7xl">

          <Link
            href="/tours"
            className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-xl pr-3 text-sm font-bold text-white/70 transition active:bg-white/5 active:text-lime-300 sm:hover:text-lime-300"
          >
            <ArrowLeft size={18} />
            Volver a tours
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap gap-2">

              <span className="rounded-full bg-lime-400 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#07130f]">
                {categoryLabels[tour.category]}
              </span>

              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/80">
                {difficultyLabels[tour.difficulty]}
              </span>

              {tour.featured && (
                <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-xs font-bold text-lime-300">
                  Experiencia destacada
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              {tour.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
              {tour.shortDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 text-sm font-semibold text-white/75">

              <div className="flex items-center gap-2">
                <MapPin
                  size={19}
                  className="text-lime-300"
                />

                {tour.location}, {tour.province}
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays
                  size={19}
                  className="text-lime-300"
                />

                <span className="capitalize">
                  {formatLongTourDate(tour.date)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <UsersRound
                  size={19}
                  className="text-lime-300"
                />

                {tour.availableSpots} cupos disponibles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          GALERÍA
      ========================================= */}

      <section className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 overflow-hidden rounded-3xl md:grid-cols-2">

          <div className="relative aspect-[4/3] overflow-hidden bg-[#dbe5df] md:aspect-auto md:min-h-[520px]">
            <Image
              src={galleryImages[0]}
              alt={`Vista principal de ${tour.title}`}
              fill
              preload
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-700 hover:scale-105"
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">

              {galleryImages
                .slice(1, 3)
                .map((image, index) => (
                  <div
                    key={image}
                    className="relative aspect-square overflow-hidden bg-[#dbe5df] md:aspect-auto"
                  >
                    <Image
                      src={image}
                      alt={`${tour.title} - fotografía ${
                        index + 2
                      }`}
                      fill
                      sizes="(max-width: 768px) 50vw, 50vw"
                      className="object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          CONTENIDO
      ========================================= */}

      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* COLUMNA PRINCIPAL */}

          <div>

            {/* Sobre */}
            <section>
              <p className="text-sm font-black uppercase tracking-[0.17em] text-[#0f5132]">
                Sobre la experiencia
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Prepárate para vivir algo diferente
              </h2>

              <p className="mt-6 whitespace-pre-line text-base leading-8 text-[#52675e] sm:text-lg">
                {tour.description}
              </p>
            </section>

            {/* Información rápida */}

            <section className="mt-14">
              <h2 className="text-2xl font-black">
                Información de la excursión
              </h2>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                <InfoCard
                  icon={<CalendarDays />}
                  label="Fecha"
                  value={formatLongTourDate(tour.date)}
                />

                <InfoCard
                  icon={<Clock3 />}
                  label="Hora de salida"
                  value={tour.departureTime}
                />

                <InfoCard
                  icon={<MapPin />}
                  label="Punto de encuentro"
                  value={tour.meetingPoint}
                />

                <InfoCard
                  icon={<Compass />}
                  label="Duración"
                  value={tour.duration ?? "Por confirmar"}
                />

                <InfoCard
                  icon={<Backpack />}
                  label="Dificultad"
                  value={
                    difficultyLabels[
                      tour.difficulty
                    ]
                  }
                />

                <InfoCard
                  icon={<UsersRound />}
                  label="Capacidad"
                  value={`${tour.capacity} participantes`}
                />
              </div>
            </section>

            {/* Disponibilidad */}

            <section className="mt-14 rounded-3xl border border-[#d9e4de] bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-bold text-[#63766d]">
                    Disponibilidad
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {isSoldOut
                      ? "Cupos agotados"
                      : `${tour.availableSpots} de ${tour.capacity} cupos disponibles`}
                  </p>
                </div>

                {isLowAvailability && (
                  <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-700">
                    🔥 Últimos cupos
                  </span>
                )}
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e8eeea]">
                <div
                  className="h-full rounded-full bg-[#0f5132] transition-all"
                  style={{
                    width: `${occupancyPercentage}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs font-bold text-[#71827a]">
                <span>
                  {bookedSpots} reservados
                </span>

                <span>
                  {occupancyPercentage}% ocupado
                </span>
              </div>
            </section>

            {/* Incluye / no incluye */}

            <section className="mt-14 grid gap-6 md:grid-cols-2">

              <div className="rounded-3xl bg-[#e8f3ec] p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f5132] text-white">
                    <Check size={22} />
                  </div>

                  <h2 className="text-xl font-black">
                    Qué incluye
                  </h2>
                </div>

                <ul className="mt-6 space-y-4">
                  {tour.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-6 text-[#40584e]"
                    >
                      <Check
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0f5132]"
                      />

                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-[#f4ecea] p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#82524b] text-white">
                    <X size={22} />
                  </div>

                  <h2 className="text-xl font-black">
                    No incluye
                  </h2>
                </div>

                <ul className="mt-6 space-y-4">
                  {tour.notIncludes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-6 text-[#68544f]"
                    >
                      <X
                        size={18}
                        className="mt-0.5 shrink-0 text-[#82524b]"
                      />

                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Qué llevar */}

            <section className="mt-14">
              <div className="flex items-center gap-3">
                <Backpack
                  size={28}
                  className="text-[#0f5132]"
                />

                <h2 className="text-2xl font-black">
                  Qué debes llevar
                </h2>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {tour.requirements.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-[#dbe4df] bg-white p-4"
                  >
                    <Check
                      size={18}
                      className="shrink-0 text-[#0f5132]"
                    />

                    <span className="text-sm font-semibold text-[#50655b]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recomendaciones */}

            <section className="mt-14">
              <h2 className="text-2xl font-black">
                Recomendaciones
              </h2>

              <div className="mt-6 space-y-3">
                {tour.recommendations.map(
                  (recommendation) => (
                    <div
                      key={recommendation}
                      className="flex gap-3 rounded-2xl bg-white p-5"
                    >
                      <Compass
                        size={20}
                        className="mt-0.5 shrink-0 text-[#0f5132]"
                      />

                      <p className="text-sm leading-6 text-[#52675e]">
                        {recommendation}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* Itinerario */}

            <section className="mt-16">
              <p className="text-sm font-black uppercase tracking-[0.17em] text-[#0f5132]">
                El recorrido
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Itinerario
              </h2>

              <div className="relative mt-8">

                <div className="absolute bottom-4 left-[19px] top-4 w-px bg-[#cbd9d1]" />

                <div className="space-y-8">
                  {tour.itinerary.map(
                    (item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="relative flex gap-5"
                      >
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f5132] text-xs font-black text-white shadow-[0_0_0_6px_#f4f7f5]">
                          {index + 1}
                        </div>

                        <div className="pb-2">
                          {item.time && (
                            <p className="text-sm font-extrabold text-[#0f5132]">
                              {item.time}
                            </p>
                          )}

                          <h3 className="mt-1 text-lg font-black">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="mt-2 max-w-2xl leading-7 text-[#61746b]">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* Seguridad */}

            <section className="mt-16 rounded-3xl bg-[#07130f] p-7 text-white sm:p-9">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-300">
                <ShieldCheck size={28} />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                Tu seguridad es parte de la experiencia
              </h2>

              <p className="mt-4 max-w-3xl leading-7 text-white/65">
                Cada excursión de Ruticas RD es
                organizada tomando en cuenta las
                condiciones del destino, la dificultad
                del recorrido y las necesidades del
                grupo.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                {tour.transportIncluded && (
                  <Feature
                    icon={<Bus />}
                    title="Transporte incluido"
                  />
                )}

                {tour.localGuideIncluded && (
                  <Feature
                    icon={<UserRoundCheck />}
                    title="Guía local cuando sea requerido"
                  />
                )}
              </div>
            </section>

            {/* Riesgos */}

            {tour.inherentRisks.length > 0 && (
              <section className="mt-14 rounded-3xl border border-orange-200 bg-orange-50 p-7">
                <div className="flex items-center gap-3 text-orange-800">
                  <AlertTriangle size={25} />

                  <h2 className="text-xl font-black">
                    Consideraciones del recorrido
                  </h2>
                </div>

                <ul className="mt-5 space-y-3">
                  {tour.inherentRisks.map(
                    (risk) => (
                      <li
                        key={risk}
                        className="flex gap-3 text-sm leading-6 text-orange-900/75"
                      >
                        <span>•</span>
                        {risk}
                      </li>
                    ),
                  )}
                </ul>
              </section>
            )}

            {/* Políticas */}

            <section className="mt-16">
              <h2 className="text-2xl font-black">
                Políticas importantes
              </h2>

              <div className="mt-6 space-y-4">

                <Policy
                  title="Puntualidad"
                  description={
                    tour.punctualityPolicy
                  }
                />

                <Policy
                  title="Cancelaciones"
                  description={
                    tour.cancellationPolicy
                  }
                />

                {tour.minorsAllowed && (
                  <Policy
                    title="Participación de menores"
                    description={
                      tour.minimumAge
                        ? `Se permiten menores según las condiciones de esta excursión. Edad mínima recomendada: ${tour.minimumAge} años. Los menores deben asistir acompañados por su padre, madre o tutor legal.`
                        : "Los menores deberán asistir acompañados por su padre, madre o tutor legal."
                    }
                  />
                )}
              </div>
            </section>
          </div>

          {/* =====================================
              RESERVATION CARD
          ====================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl border border-[#d9e4de] bg-white p-6 shadow-xl shadow-[#10291d]/10">

              <p className="text-sm font-bold text-[#687c72]">
                Precio por persona
              </p>

              <p className="mt-1 text-4xl font-black text-[#07130f]">
                {formatDop(tour.price)}
              </p>

              {tour.depositAmount > 0 && (
                <div className="mt-4 rounded-2xl bg-[#edf5f0] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6b7e75]">
                    Asegura tu cupo desde
                  </p>

                  <p className="mt-1 text-xl font-black text-[#0f5132]">
                    {formatDop(
                      tour.depositAmount,
                    )}
                  </p>
                </div>
              )}

              <div className="my-6 h-px bg-[#e4ebe7]" />

              <div className="space-y-4 text-sm">

                <div className="flex justify-between gap-4">
                  <span className="text-[#718078]">
                    Fecha
                  </span>

                  <span className="text-right font-bold capitalize">
                    {formatLongTourDate(tour.date)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#718078]">
                    Dificultad
                  </span>

                  <span className="font-bold">
                    {
                      difficultyLabels[
                        tour.difficulty
                      ]
                    }
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#718078]">
                    Cupos
                  </span>

                  <span
                    className={
                      isLowAvailability
                        ? "font-black text-orange-600"
                        : "font-black text-[#0f5132]"
                    }
                  >
                    {isSoldOut
                      ? "Agotados"
                      : `${tour.availableSpots} disponibles`}
                  </span>
                </div>
              </div>

              <Link
                href={reservationHref}
                className={`mt-7 flex min-h-14 w-full touch-manipulation items-center justify-center rounded-full px-6 text-center font-black transition active:scale-[0.98] ${
                  isSoldOut
                    ? "bg-[#14231c] text-white active:bg-[#20352b] sm:hover:bg-[#20352b]"
                    : "bg-lime-400 text-[#07130f] active:bg-lime-300 sm:hover:-translate-y-0.5 sm:hover:bg-lime-300"
                }`}
              >
                {isSoldOut
                  ? "Unirme a la lista de espera"
                  : "Reservar mi cupo"}
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-[#84938c]">
                Tu reservación será confirmada
                después de verificar el pago o
                abono correspondiente.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* =========================================
          CTA MÓVIL
      ========================================= */}

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[#dbe4df] bg-white/95 px-4 pt-3 shadow-[0_-8px_30px_rgba(7,19,15,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#7b8c84]">
              Desde
            </p>

            <p className="truncate text-xl font-black text-[#07130f]">
              {formatDop(tour.price)}
            </p>
          </div>

          <Link
            href={reservationHref}
            className="inline-flex min-h-12 shrink-0 touch-manipulation items-center justify-center rounded-full bg-lime-400 px-6 py-3 text-sm font-black text-[#07130f] transition active:scale-[0.98] active:bg-lime-300"
          >
            {isSoldOut
              ? "Lista de espera"
              : "Reservar"}
          </Link>
        </div>
      </div>
    </main>
  );
}

/* =============================================
   COMPONENTES INTERNOS
============================================= */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#dbe4df] bg-white p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf5f0] text-[#0f5132] [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#84938c]">
          {label}
        </p>

        <p className="mt-1 font-black capitalize">
          {value}
        </p>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-lime-300 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>

      <span className="text-sm font-bold text-white/80">
        {title}
      </span>
    </div>
  );
}

function Policy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dbe4df] bg-white p-6">
      <h3 className="font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-[#61746b]">
        {description}
      </p>
    </div>
  );
}

function absoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://ruticasrd.com${value.startsWith("/") ? value : `/${value}`}`;
}

function eventStatus(status: TourStatus) {
  if (status === "cancelado") return "https://schema.org/EventCancelled";
  if (status === "pospuesto") return "https://schema.org/EventPostponed";
  return "https://schema.org/EventScheduled";
}
