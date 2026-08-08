import Link from "next/link";
import { ArrowRight, MapPin, Mountain, UsersRound } from "lucide-react";

import { siteContent } from "@/data/site-content";

const experienceItems = [
  {
    title: "Naturaleza",
    description: "Senderos, montañas y cascadas",
    icon: Mountain,
  },
  {
    title: "Comunidad",
    description: "Experiencias para compartir",
    icon: UsersRound,
  },
  {
    title: "República Dominicana",
    description: "Destinos que merecen ser descubiertos",
    icon: MapPin,
  },
];

export default function HeroSection() {
  const { hero } = siteContent;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#07130f]">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/images/hero/hero-home-mobile.webp"
        />
        <img
          src="/images/hero/hero-home.webp"
          alt="Participantes de Ruticas RD disfrutando una excursión en la naturaleza"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>

      <div className="absolute inset-0 bg-black/45 md:bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07130f]/90 via-[#07130f]/35 to-[#07130f]/30 md:bg-gradient-to-r md:from-[#07130f] md:via-[#07130f]/75 md:to-[#07130f]/15" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#07130f] to-transparent" />

      <div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-end px-4 pb-12 sm:px-6 sm:pb-16 md:items-center md:pb-20 lg:px-8"
        style={{ paddingTop: "calc(8rem + env(safe-area-inset-top, 0px))" }}
      >
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-lime-300 backdrop-blur-md sm:mb-6 sm:px-4 sm:text-sm sm:tracking-[0.18em]">
            <Mountain size={17} aria-hidden="true" />
            {hero.eyebrow}
          </div>

          <h1 className="max-w-3xl text-[2.35rem] font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Descubre República Dominicana,
            <span className="block text-lime-300">una aventura a la vez.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:mt-6 sm:text-lg sm:leading-8">
            {hero.description}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4">
            <Link
              href={hero.primaryAction.href}
              className="inline-flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3.5 text-base font-extrabold text-[#07130f] shadow-lg shadow-black/20 transition active:scale-[0.98] active:bg-lime-300 sm:px-7 sm:hover:-translate-y-0.5 sm:hover:bg-lime-300"
            >
              {hero.primaryAction.label}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>

            <Link
              href={hero.secondaryAction.href}
              className="inline-flex min-h-14 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur-md transition active:scale-[0.98] active:bg-white/20 sm:px-7 sm:hover:bg-white/20"
            >
              {hero.secondaryAction.label}
            </Link>
          </div>

          <div className="mt-7 grid max-w-3xl gap-2.5 sm:mt-12 sm:grid-cols-3 sm:gap-3">
            {experienceItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3.5 backdrop-blur-md sm:items-start sm:p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-white/65 sm:mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
