import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

import { FaInstagram } from "react-icons/fa";

import { siteContent } from "@/data/site-content";
import { createWhatsAppUrl } from "@/lib/whatsapp";

const exploreLinks = [
  {
    label: "Próximos tours",
    href: "/tours",
  },
  {
    label: "Galería",
    href: "/galeria",
  },
  {
    label: "Nosotros",
    href: "/nosotros",
  },
];

const informationLinks = [
  {
    label: "Preguntas frecuentes",
    href: "/preguntas-frecuentes",
  },
  {
    label: "Políticas",
    href: "/politicas",
  },
  {
    label: "Contacto",
    href: "/contacto",
  },
];

export default function Footer() {
  const whatsappUrl = createWhatsAppUrl(
    siteContent.contact.whatsapp,
    "¡Hola Ruticas RD! Me gustaría recibir información sobre sus próximas excursiones.",
  );

  return (
    <footer className="bg-[#06100c] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-20">

        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1fr]">

          {/* MARCA */}

          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-white">
                <Image
                  src="/images/brand/logo-ruticas.png"
                  alt="Logo de Ruticas RD"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>

              <div>
                <p className="text-lg font-black">
                  Ruticas RD
                </p>

                <p className="mt-0.5 text-xs font-bold tracking-wide text-lime-300">
                  Explora. Conecta. Vive.
                </p>
              </div>
            </Link>

            <p className="mt-6 text-sm leading-7 text-white/55">
              Descubre montañas, senderos, cascadas,
              playas y destinos inolvidables de la
              República Dominicana junto a una comunidad
              que ama la aventura y la naturaleza.
            </p>

            <div className="mt-6 flex items-center gap-3">

              <a
                href={siteContent.contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram de Ruticas RD"
                className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-95 hover:bg-white/10 hover:text-lime-300"
              >
               <FaInstagram size={21} />
              </a>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Contactar Ruticas RD por WhatsApp"
                  className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-95 hover:bg-white/10 hover:text-lime-300"
                >
                  <MessageCircle size={21} />
                </a>
              )}
            </div>
          </div>

          {/* EXPLORA */}

          <FooterColumn
            title="Explora"
            links={exploreLinks}
          />

          {/* INFORMACIÓN */}

          <FooterColumn
            title="Información"
            links={informationLinks}
          />

          {/* CONTACTO */}

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.17em] text-white/40">
              Contáctanos
            </h2>

            <div className="mt-5 space-y-4">

              <div className="flex items-start gap-3 text-sm leading-6 text-white/60">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-lime-300"
                />

                <span>
                  {siteContent.contact.location}
                </span>
              </div>

              {siteContent.contact.email && (
                <a
                  href={`mailto:${siteContent.contact.email}`}
                  className="flex items-center gap-3 text-sm text-white/60 transition hover:text-white"
                >
                  <Mail
                    size={18}
                    className="shrink-0 text-lime-300"
                  />

                  {siteContent.contact.email}
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-black text-[#07130f] transition active:scale-[0.98] hover:bg-lime-300"
                >
                  <MessageCircle size={18} />
                  Hablar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div className="flex flex-col gap-4 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 Ruticas RD. Todos los derechos
            reservados.
          </p>

          <p>
            Hecho para explorar República Dominicana 🇩🇴
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-black uppercase tracking-[0.17em] text-white/40">
        {title}
      </h2>

      <nav className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex w-fit touch-manipulation items-center gap-1 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            {link.label}

            <ArrowUpRight
              size={14}
              className="opacity-0 transition group-hover:opacity-100"
            />
          </Link>
        ))}
      </nav>
    </div>
  );
}