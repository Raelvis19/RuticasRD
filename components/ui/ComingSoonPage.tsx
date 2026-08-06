import Link from "next/link";
import { ArrowLeft, Mountain } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export default function ComingSoonPage({
  title,
  description = "Estamos preparando esta sección de Ruticas RD.",
}: ComingSoonPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07130f] px-5 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-300">
          <Mountain size={32} aria-hidden="true" />
        </div>

        <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.18em] text-lime-300">
          Ruticas RD
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          {title}
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/65">
          {description}
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 font-extrabold text-[#07130f] transition hover:bg-lime-300"
        >
          <ArrowLeft size={19} aria-hidden="true" />
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}