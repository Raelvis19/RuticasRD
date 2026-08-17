import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Compass,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  UsersRound,
} from "lucide-react";

import { FaInstagram } from "react-icons/fa";

import { siteContent } from "@/data/site-content";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta a Ruticas RD para recibir información sobre excursiones, reservaciones, pagos y próximas aventuras.",
  alternates: { canonical: "/contacto" },
};

const contactTopics = [
  {
    title: "Próximas excursiones",
    description:
      "Quiero conocer los próximos destinos y fechas disponibles.",
    message:
      "¡Hola Ruticas RD! Me gustaría conocer sus próximas excursiones y fechas disponibles.",
    icon: Compass,
  },
  {
    title: "Mi reservación",
    description:
      "Tengo una pregunta relacionada con una reservación.",
    message:
      "¡Hola Ruticas RD! Necesito ayuda con una reservación.",
    icon: CalendarDays,
  },
  {
    title: "Pagos y abonos",
    description:
      "Necesito información sobre pagos, abonos o comprobantes.",
    message:
      "¡Hola Ruticas RD! Tengo una pregunta relacionada con pagos o abonos de una excursión.",
    icon: CircleDollarSign,
  },
  {
    title: "Reservación grupal",
    description:
      "Quiero participar junto a varias personas.",
    message:
      "¡Hola Ruticas RD! Me gustaría recibir información para realizar una reservación grupal.",
    icon: UsersRound,
  },
];

export default function ContactoPage() {
  const generalWhatsAppUrl = createWhatsAppUrl(
    siteContent.contact.whatsapp,
    "¡Hola Ruticas RD! Vi su página web y me gustaría recibir información.",
  );

  return (
    <main className="overflow-hidden bg-[#f4f7f5] text-[#14231c]">

      {/* HERO */}

      <section className="bg-[#07130f] px-5 pb-16 pt-32 text-white sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
            <MessageCircle size={27} />
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-lime-300">
            Estamos para ayudarte
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
            Tu próxima aventura puede comenzar con un mensaje.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Si tienes preguntas sobre una excursión, reservación,
            pago o próxima experiencia, comunícate con Ruticas RD.
          </p>

          {generalWhatsAppUrl && (
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="
                mt-8 inline-flex min-h-14
                touch-manipulation items-center
                justify-center gap-3 rounded-full
                bg-lime-400 px-7
                font-black text-[#07130f]
                transition
                active:scale-[0.98]
                hover:bg-lime-300
              "
            >
              <MessageCircle size={21} />
              Hablar por WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* CANALES */}

      <section className="px-5 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
              Canales oficiales
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Elige la forma más cómoda de comunicarte.
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* WHATSAPP */}

            {generalWhatsAppUrl && (
              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  group rounded-[1.75rem]
                  bg-[#0f5132] p-6 text-white
                  transition
                  active:scale-[0.99]
                  lg:hover:-translate-y-1
                  lg:hover:shadow-xl
                "
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
                    <MessageCircle size={24} />
                  </div>

                  <ArrowRight
                    size={21}
                    className="text-white/40 transition group-hover:translate-x-1 group-hover:text-white"
                  />
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-lime-300">
                  Respuesta directa
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  WhatsApp
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  Ideal para preguntas sobre tours, reservaciones,
                  pagos y disponibilidad.
                </p>
              </a>
            )}

            {/* INSTAGRAM */}

            {siteContent.contact.instagramUrl && (
              <a
                href={siteContent.contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  group rounded-[1.75rem]
                  border border-[#dce5df]
                  bg-white p-6
                  transition
                  active:scale-[0.99]
                  lg:hover:-translate-y-1
                  lg:hover:shadow-lg
                "
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#0f5132]">
                    <FaInstagram size={24} />
                  </div>

                  <ArrowRight
                    size={21}
                    className="text-[#8b9992] transition group-hover:translate-x-1 group-hover:text-[#0f5132]"
                  />
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#0f5132]">
                  Síguenos
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Instagram
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#65786f]">
                  Descubre nuevas rutas, fotografías, videos y
                  novedades de nuestra comunidad.
                </p>

                {siteContent.contact.instagramUsername && (
                  <p className="mt-5 font-black text-[#0f5132]">
                    @{siteContent.contact.instagramUsername}
                  </p>
                )}
              </a>
            )}

            {/* EMAIL */}

            {siteContent.contact.email && (
              <a
                href={`mailto:${siteContent.contact.email}`}
                className="
                  group rounded-[1.75rem]
                  border border-[#dce5df]
                  bg-white p-6
                  transition
                  active:scale-[0.99]
                  lg:hover:-translate-y-1
                  lg:hover:shadow-lg
                "
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#0f5132]">
                    <Mail size={24} />
                  </div>

                  <ArrowRight
                    size={21}
                    className="text-[#8b9992] transition group-hover:translate-x-1 group-hover:text-[#0f5132]"
                  />
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#0f5132]">
                  Correo
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Escríbenos
                </h3>

                <p className="mt-3 break-all text-sm font-semibold leading-7 text-[#65786f]">
                  {siteContent.contact.email}
                </p>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* TEMAS */}

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
              ¿Sobre qué quieres hablar?
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Llega directamente a la información que necesitas.
            </h2>

            <p className="mt-4 leading-7 text-[#63766d]">
              Selecciona una opción y prepararemos automáticamente
              el mensaje para WhatsApp.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {contactTopics.map((topic) => {
              const Icon = topic.icon;

              const topicWhatsAppUrl = createWhatsAppUrl(
                siteContent.contact.whatsapp,
                topic.message,
              );

              if (!topicWhatsAppUrl) {
                return (
                  <div
                    key={topic.title}
                    className="rounded-[1.5rem] border border-[#dce5df] bg-[#f8faf9] p-5 sm:p-6"
                  >
                    <TopicContent
                      Icon={Icon}
                      title={topic.title}
                      description={topic.description}
                    />
                  </div>
                );
              }

              return (
                <a
                  key={topic.title}
                  href={topicWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    group rounded-[1.5rem]
                    border border-[#dce5df]
                    bg-[#f8faf9] p-5
                    transition
                    active:scale-[0.99]
                    hover:border-[#b8cabf]
                    hover:bg-[#f3f7f4]
                    sm:p-6
                  "
                >
                  <TopicContent
                    Icon={Icon}
                    title={topic.title}
                    description={topic.description}
                    interactive
                  />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] bg-[#07130f] text-white">

            <div className="grid lg:grid-cols-2">

              <div className="p-7 sm:p-10 lg:p-14">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
                  <MapPin size={24} />
                </div>

                <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-lime-300">
                  Nuestra base
                </p>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  San Francisco de Macorís
                </h2>

                <p className="mt-4 text-base leading-8 text-white/60">
                  {siteContent.contact.location}
                </p>

                <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
                  Desde aquí comienza nuestra misión de conectar
                  personas con destinos y experiencias alrededor de
                  República Dominicana.
                </p>
              </div>

              <div className="relative min-h-[280px] overflow-hidden bg-[#0c261b] sm:min-h-[340px]">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute left-[15%] top-[25%] h-32 w-32 rounded-full border border-lime-300/40" />
                  <div className="absolute right-[12%] top-[18%] h-52 w-52 rounded-full border border-white/10" />
                  <div className="absolute bottom-[10%] left-[35%] h-40 w-40 rounded-full border border-lime-300/20" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-300 text-[#07130f] shadow-2xl">
                      <MapPin size={34} />
                    </div>

                    <p className="mt-5 text-xl font-black">
                      República Dominicana 🇩🇴
                    </p>

                    <p className="mt-2 text-sm text-white/45">
                      El próximo destino nos espera.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}

      <section className="px-5 pb-16 pt-2 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">

          <Link
            href="/preguntas-frecuentes"
            className="
              group rounded-[1.75rem]
              border border-[#dce5df]
              bg-white p-6
              transition
              active:scale-[0.99]
              hover:shadow-lg
              sm:p-8
            "
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f0] text-[#0f5132]">
              <HelpCircle size={23} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Preguntas frecuentes
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#687b72]">
              Encuentra respuestas sobre reservaciones, pagos,
              transporte, menores, cancelaciones y más.
            </p>

            <span className="mt-6 flex items-center gap-2 font-black text-[#0f5132]">
              Ver preguntas
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </Link>

          <Link
            href="/tours"
            className="
              group rounded-[1.75rem]
              bg-[#0f5132] p-6
              text-white transition
              active:scale-[0.99]
              hover:shadow-lg
              sm:p-8
            "
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
              <Compass size={23} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Explora nuestras rutas
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/65">
              Revisa destinos, fechas, disponibilidad, precios y
              todos los detalles antes de reservar.
            </p>

            <span className="mt-6 flex items-center gap-2 font-black text-lime-300">
              Ver próximos tours
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </Link>

        </div>
      </section>

    </main>
  );
}

function TopicContent({
  Icon,
  title,
  description,
  interactive = false,
}: {
  Icon: typeof Compass;
  title: string;
  description: string;
  interactive?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e4f0e8] text-[#0f5132]">
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-black">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#6b7d74]">
          {description}
        </p>
      </div>

      {interactive && (
        <ArrowRight
          size={19}
          className="mt-1 shrink-0 text-[#93a198] transition group-hover:translate-x-1 group-hover:text-[#0f5132]"
        />
      )}
    </div>
  );
}
