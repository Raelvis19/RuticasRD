import Link from "next/link";

import {
  ArrowRight,
  CircleDollarSign,
  HelpCircle,
  MessageCircle,
  Route,
  TicketCheck,
  Umbrella,
} from "lucide-react";

import FaqAccordion from "@/components/faq/FaqAccordion";
import { faqs } from "@/data/faqs";
import { siteContent } from "@/data/site-content";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export const metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre reservas, pagos, transporte, participantes, cancelaciones y excursiones de Ruticas RD.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

const categories = [
  {
    key: "reservas" as const,
    eyebrow: "Antes de comenzar",
    title: "Reservas",
    description:
      "Todo lo relacionado con cupos, datos y confirmaciones.",
    icon: TicketCheck,
  },
  {
    key: "pagos" as const,
    eyebrow: "Tu reservación",
    title: "Pagos y abonos",
    description:
      "Cómo funcionan los pagos y la verificación.",
    icon: CircleDollarSign,
  },
  {
    key: "experiencia" as const,
    eyebrow: "Prepárate",
    title: "La experiencia",
    description:
      "Transporte, dificultad, menores y qué debes llevar.",
    icon: Route,
  },
  {
    key: "cambios" as const,
    eyebrow: "Es bueno saberlo",
    title: "Cambios y cancelaciones",
    description:
      "Cancelaciones, puntualidad y cupos agotados.",
    icon: Umbrella,
  },
];

export default function PreguntasFrecuentesPage() {
  const whatsappUrl = createWhatsAppUrl(
    siteContent.contact.whatsapp,
    "¡Hola Ruticas RD! Tengo una pregunta sobre sus excursiones.",
  );

  return (
    <main className="bg-[#f4f7f5] text-[#14231c]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />

      {/* HERO */}

      <section className="bg-[#07130f] px-5 pb-16 pt-32 text-white sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
            <HelpCircle size={27} />
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-lime-300">
            Preguntas frecuentes
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
            Todo lo que necesitas saber antes de tu próxima aventura.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Resolvemos las dudas más comunes sobre reservas,
            pagos, transporte, participantes y condiciones de
            nuestras excursiones.
          </p>

        </div>
      </section>

      {/* CATEGORÍAS */}

      <section className="px-5 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">

          <div className="space-y-14 sm:space-y-16">
            {categories.map((category) => {
              const Icon = category.icon;

              const categoryFaqs = faqs.filter(
                (faq) => faq.category === category.key,
              );

              return (
                <section
                  key={category.key}
                  id={category.key}
                  className="scroll-mt-28"
                >
                  <div className="mb-6 flex items-start gap-4 sm:mb-8">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e4f0e8] text-[#0f5132]">
                      <Icon size={23} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.17em] text-[#0f5132]">
                        {category.eyebrow}
                      </p>

                      <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                        {category.title}
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#6b7d74]">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <FaqAccordion items={categoryFaqs} />
                </section>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#0f5132] px-6 py-9 text-white sm:px-10 sm:py-12">

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-[#07130f]">
                <MessageCircle size={23} />
              </div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                ¿Todavía tienes alguna pregunta?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Escríbenos y con gusto te ayudaremos a resolver cualquier
                duda antes de reservar.
              </p>
            </div>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-7 font-black text-[#07130f] transition active:scale-[0.98] hover:bg-lime-300"
              >
                Preguntar por WhatsApp
                <ArrowRight size={19} />
              </a>
            ) : (
              <Link
                href="/contacto"
                className="flex min-h-14 touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-7 font-black text-[#07130f] transition active:scale-[0.98] hover:bg-lime-300"
              >
                Contactarnos
                <ArrowRight size={19} />
              </Link>
            )}
          </div>

        </div>
      </section>

    </main>
  );
}
