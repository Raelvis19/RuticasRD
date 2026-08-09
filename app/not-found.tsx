import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Compass,
  MapPin,
  Mountain,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-[85svh] overflow-hidden bg-[#07130f] px-5 pb-16 pt-32 text-white sm:px-6 sm:pt-36 lg:px-8">
      {/* Decoración */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-lime-300/10" />
        <div className="absolute -right-6 top-44 h-44 w-44 rounded-full border border-lime-300/10" />
        <div className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-[#0f5132]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[65svh] max-w-5xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">

          {/* TEXTO */}

          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
              <Compass size={27} />
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-lime-300">
              Error 404
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
              Parece que esta ruta
              <span className="block text-lime-300">
                no lleva a ningún destino.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/60 sm:text-lg">
              La página que estás buscando no existe, fue movida
              o la dirección puede estar escrita incorrectamente.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="
                  flex min-h-14 touch-manipulation
                  items-center justify-center gap-2
                  rounded-full bg-lime-400
                  px-7 font-black text-[#07130f]
                  transition
                  active:scale-[0.98]
                  hover:bg-lime-300
                "
              >
                <ArrowLeft size={19} />
                Volver al inicio
              </Link>

              <Link
                href="/tours"
                className="
                  flex min-h-14 touch-manipulation
                  items-center justify-center gap-2
                  rounded-full border border-white/15
                  bg-white/[0.05] px-7
                  font-black text-white
                  transition
                  active:scale-[0.98]
                  hover:bg-white/10
                "
              >
                <Mountain size={19} />
                Explorar tours
              </Link>
            </div>
          </div>

          {/* BLOQUE VISUAL */}

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">

              <div className="absolute inset-0 bg-gradient-to-br from-lime-300/[0.04] to-transparent" />

              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                  <Image
                    src="/images/brand/logo-ruticas-white.png"
                    alt="Ruticas RD"
                    fill
                    sizes="112px"
                    className="object-contain"
                  />
                </div>

                <p className="mt-6 text-7xl font-black tracking-tighter text-white sm:text-8xl">
                  404
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-white/45">
                  <MapPin size={17} className="text-lime-300" />
                  Destino no encontrado
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}