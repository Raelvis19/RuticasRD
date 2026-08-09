"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Home,
  RefreshCw,
  Route,
} from "lucide-react";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <main className="relative min-h-[80svh] overflow-hidden bg-[#07130f] px-5 pb-16 pt-32 text-white sm:px-6 sm:pt-36 lg:px-8">

      {/* DECORACIÓN */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full border border-lime-300/10" />

        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#0f5132]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[60svh] max-w-4xl items-center">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md sm:p-10 lg:p-12">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-300 text-[#07130f]">
            <AlertTriangle size={27} />
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-lime-300">
            Algo salió mal
          </p>

          <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Esta ruta encontró un pequeño obstáculo.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">
            No pudimos completar esta acción en este momento.
            Puedes intentarlo nuevamente o regresar al inicio.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={reset}
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
              <RefreshCw size={19} />
              Intentar nuevamente
            </button>

            <Link
              href="/"
              className="
                flex min-h-14 touch-manipulation
                items-center justify-center gap-2
                rounded-full border border-white/15
                bg-white/[0.05]
                px-7 font-black text-white
                transition
                active:scale-[0.98]
                hover:bg-white/10
              "
            >
              <Home size={19} />
              Ir al inicio
            </Link>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <Link
              href="/tours"
              className="inline-flex touch-manipulation items-center gap-2 text-sm font-bold text-white/50 transition hover:text-lime-300"
            >
              <Route size={17} />
              Explorar otras experiencias
            </Link>
          </div>

          {/* Información técnica solo útil para identificar error */}

          {error.digest && (
            <p className="mt-5 break-all text-[11px] text-white/20">
              Referencia: {error.digest}
            </p>
          )}

        </section>
      </div>
    </main>
  );
}