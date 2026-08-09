import Link from "next/link";

import {
  ArrowRight,
  FileCheck2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { policies } from "@/data/policies";

export default function PoliticasPage() {
  return (
    <main className="bg-[#f4f7f5] text-[#14231c]">

      {/* HERO */}

      <section className="bg-[#07130f] px-5 pb-16 pt-32 text-white sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
            <ShieldCheck size={27} />
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-lime-300">
            Información importante
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
            Condiciones claras para disfrutar la aventura con confianza.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Aquí encontrarás las condiciones generales relacionadas
            con reservaciones, pagos, cancelaciones, seguridad,
            participantes y uso de información.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold text-white/50">
            <FileCheck2 size={16} />

            Última actualización: agosto de 2026
          </div>
        </div>
      </section>

      {/* NAVEGACIÓN RÁPIDA */}

      <section className="border-b border-[#dce5df] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-[#74867d]">
            Ir directamente a
          </p>

          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
            {policies.map((policy) => (
              <a
                key={policy.id}
                href={`#${policy.id}`}
                className="
                  flex min-h-11 shrink-0
                  touch-manipulation items-center
                  rounded-full
                  border border-[#dce5df]
                  bg-[#f8faf9]
                  px-4
                  text-sm font-bold
                  text-[#52675e]
                  transition
                  active:scale-[0.98]
                  hover:border-[#0f5132]
                  hover:text-[#0f5132]
                "
              >
                {policy.shortTitle}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO */}

      <section className="px-5 pb-5 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.75rem] border border-[#dce5df] bg-white p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.17em] text-[#0f5132]">
              Antes de reservar
            </p>

            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Queremos que sepas cómo funciona cada experiencia.
            </h2>

            <p className="mt-4 leading-8 text-[#62756c]">
              Estas condiciones generales sirven como marco para las
              actividades de Ruticas RD. Algunos tours pueden tener
              condiciones particulares debido al destino, dificultad,
              proveedores involucrados, capacidad, clima u otras
              características de la experiencia.
            </p>

            <p className="mt-4 leading-8 text-[#62756c]">
              Antes de enviar una reservación podrás consultar también
              la información específica de la excursión seleccionada.
            </p>
          </div>
        </div>
      </section>

      {/* POLÍTICAS */}

      <section className="px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {policies.map((policy, index) => {
            const Icon = policy.icon;

            return (
              <article
                key={policy.id}
                id={policy.id}
                className="
                  scroll-mt-28
                  overflow-hidden
                  rounded-[1.75rem]
                  border border-[#dce5df]
                  bg-white
                  shadow-sm
                "
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e4f0e8] text-[#0f5132]">
                      <Icon size={23} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.17em] text-[#0f5132]">
                        Política {String(index + 1).padStart(2, "0")}
                      </p>

                      <h2 className="mt-1 text-xl font-black leading-tight sm:text-2xl">
                        {policy.title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#71827a]">
                        {policy.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    {policy.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f5132]" />

                        <p className="text-sm leading-7 text-[#52675e] sm:text-[15px]">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>

                  {policy.important && (
                    <div className="mt-7 rounded-2xl bg-[#edf5f0] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f5132]">
                        Importante
                      </p>

                      <p className="mt-2 text-sm font-semibold leading-7 text-[#4e665b]">
                        {policy.important}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* PRIVACIDAD / ACLARACIÓN */}

      <section className="px-5 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[1.75rem] bg-[#07130f] p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.17em] text-lime-300">
              Transparencia
            </p>

            <h2 className="mt-3 text-2xl font-black">
              Las reglas específicas estarán visibles antes de reservar.
            </h2>

            <p className="mt-4 leading-7 text-white/60">
              El precio, abono, fecha límite, política de cancelación,
              dificultad, requisitos y demás condiciones particulares
              deben consultarse en la página de la excursión antes de
              enviar una solicitud.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="px-5 pb-16 pt-6 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#0f5132] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
                <MessageCircle size={23} />
              </div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                ¿Necesitas aclarar alguna condición?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Escríbenos antes de realizar tu reservación y con gusto
                aclararemos cualquier duda relacionada con la
                experiencia.
              </p>
            </div>

            <Link
              href="/contacto"
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
              Contactar Ruticas RD

              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}