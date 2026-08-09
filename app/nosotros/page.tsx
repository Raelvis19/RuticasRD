import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Compass,
  Leaf,
  MapPin,
  Mountain,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Seguridad",
    description:
      "Planificamos cada experiencia buscando que el grupo disfrute de manera organizada, responsable y segura.",
  },
  {
    icon: Compass,
    title: "Organización",
    description:
      "Desde antes de salir hasta regresar a casa, cada aventura se prepara con información clara y acompañamiento.",
  },
  {
    icon: UsersRound,
    title: "Comunidad",
    description:
      "Queremos que cada excursión también sea una oportunidad para conocer personas, compartir y crear recuerdos.",
  },
  {
    icon: Leaf,
    title: "Naturaleza",
    description:
      "Promovemos experiencias que permitan descubrir y valorar los paisajes y destinos naturales de República Dominicana.",
  },
];

export default function NosotrosPage() {
  return (
    <main className="overflow-hidden bg-[#f4f7f5] text-[#14231c]">

      {/* HERO */}

      <section className="relative min-h-[72svh] overflow-hidden bg-[#07130f] sm:min-h-[78vh]">
        <Image
          src="/images/about/historia-ruticas-01.webp"
          alt="Experiencia de Ruticas RD en República Dominicana"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07130f] via-[#07130f]/65 to-[#07130f]/25" />

        <div className="relative mx-auto flex min-h-[72svh] max-w-7xl items-end px-5 pb-14 pt-32 sm:min-h-[78vh] sm:px-6 sm:pb-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-300 sm:text-sm">
              Sobre Ruticas RD
            </p>

            <h1 className="mt-4 text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              No solo visitamos lugares.
              <span className="block text-lime-300">
                Creamos experiencias.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Nacimos con la idea de conectar personas con la
              naturaleza, la aventura y los increíbles destinos
              que tiene República Dominicana.
            </p>
          </div>
        </div>
      </section>

      {/* HISTORIA */}

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">

          <div className="order-2 lg:order-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
              Nuestra historia
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Una idea que nació para descubrir más de nuestra isla
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-[#60746b]">
              <p>
                Ruticas RD nació con el propósito de inspirar a más
                personas a descubrir los paisajes, montañas, ríos,
                playas y lugares únicos que existen en República
                Dominicana.
              </p>

              <p>
                Queremos que explorar el país sea una experiencia
                organizada, cercana y memorable, donde cada persona
                pueda sentirse parte de un grupo y disfrutar de la
                aventura con mayor confianza.
              </p>

              <p>
                Más que organizar excursiones, buscamos crear historias
                que las personas quieran recordar, compartir y volver a
                vivir.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#dce5df] shadow-xl sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="/images/about/equipo-ruticas-01.webp"
                alt="Equipo y comunidad de Ruticas RD"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#07130f]/85 p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-300">
                  Explora. Conecta. Vive.
                </p>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  La aventura se disfruta más cuando se comparte.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PRIMERA AVENTURA */}

      <section className="bg-[#07130f] px-5 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={CalendarDays}
              eyebrow="Inicio oficial"
              title="2 de agosto de 2026"
              description="El comienzo de una nueva comunidad de aventura."
            />

            <InfoCard
              icon={MapPin}
              eyebrow="Primera experiencia"
              title="Constanza"
              description="El destino donde comenzó oficialmente la historia de Ruticas RD."
            />
          </div>

          <div className="mt-10 max-w-3xl sm:mt-14">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
              El comienzo
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              Toda gran aventura comienza con una primera ruta.
            </h2>

            <p className="mt-5 text-base leading-8 text-white/60 sm:text-lg">
              Constanza marcó el inicio oficial de Ruticas RD. A partir
              de ahí comienza una historia que queremos construir junto
              a cada persona que decida salir, explorar y descubrir una
              nueva parte del país con nosotros.
            </p>
          </div>
        </div>
      </section>

      {/* MISIÓN */}

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e4f0e8] text-[#0f5132]">
                <Mountain size={30} />
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
                Nuestra misión
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                Hacer que descubrir República Dominicana se convierta
                en una experiencia inolvidable.
              </h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <p className="text-lg font-semibold leading-8 text-[#42584e] sm:text-xl sm:leading-9">
                Crear experiencias de aventura y turismo que permitan a
                las personas explorar la belleza natural de República
                Dominicana, fomentar nuevas amistades y promover un
                turismo responsable, seguro y organizado.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* VALORES */}

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
              Nuestra forma de hacer las cosas
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Una aventura bien organizada se disfruta diferente.
            </h2>

            <p className="mt-5 leading-7 text-[#60746b]">
              Estos principios están presentes antes, durante y después
              de cada experiencia.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="rounded-[1.75rem] border border-[#e0e8e3] bg-[#f8faf9] p-6 transition lg:hover:-translate-y-1 lg:hover:shadow-lg"
                >
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#e5f1e9] text-[#0f5132]">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#687b72]">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIFERENCIADOR */}

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0f5132] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16 lg:py-16">

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">

            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
                ¿Por qué Ruticas RD?
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                Organización, cercanía y aventura en una misma
                experiencia.
              </h2>

              <p className="mt-5 max-w-2xl leading-8 text-white/65">
                Desde que preguntas por una excursión hasta que
                finalizamos el recorrido, queremos que tengas
                información clara, acompañamiento y una experiencia
                que realmente valga la pena recordar.
              </p>
            </div>

            <Link
              href="/tours"
              className="flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-7 font-black text-[#07130f] transition active:scale-[0.98] hover:bg-lime-300"
            >
              Explorar próximos tours
              <ArrowRight size={19} />
            </Link>

          </div>
        </div>
      </section>

      {/* CTA FINAL */}

      <section className="px-5 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">

          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
            La próxima historia puede ser la tuya
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            ¿Listo para descubrir tu próxima ruta?
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#60746b]">
            Explora nuestras próximas experiencias y encuentra la
            aventura que quieres vivir.
          </p>

          <Link
            href="/tours"
            className="mt-8 inline-flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-[#07130f] px-8 font-black text-white transition active:scale-[0.98] hover:bg-[#0f5132]"
          >
            Ver experiencias
            <ArrowRight size={19} />
          </Link>

        </div>
      </section>

    </main>
  );
}

function InfoCard({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof CalendarDays;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
        <Icon size={23} />
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.17em] text-white/40">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/55">
        {description}
      </p>
    </article>
  );
}