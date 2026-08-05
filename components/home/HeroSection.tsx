import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    MapPin,
    Mountain,
    UsersRound,
} from "lucide-react";

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
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
            </picture>

            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#07130f] via-[#07130f]/75 to-[#07130f]/15" />

            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#07130f] to-transparent" />

            <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-center px-5 pb-20 pt-32 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-lime-300 backdrop-blur-md sm:text-sm">
                        <Mountain size={17} aria-hidden="true" />
                        {hero.eyebrow}
                    </div>

                    <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        Descubre República Dominicana,
                        <span className="block text-lime-300">
                            una aventura a la vez.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                        {hero.description}
                    </p>

                    <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                        <Link
                            href={hero.primaryAction.href}
                            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-extrabold text-[#07130f] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-lime-300 sm:text-base"
                        >
                            {hero.primaryAction.label}
                            <ArrowRight size={19} aria-hidden="true" />
                        </Link>

                        <Link
                            href={hero.secondaryAction.href}
                            className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20 sm:text-base"
                        >
                            {hero.secondaryAction.label}
                        </Link>
                    </div>

                    <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
                        {experienceItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
                                        <Icon size={20} aria-hidden="true" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-extrabold text-white">
                                            {item.title}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-white/60">
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