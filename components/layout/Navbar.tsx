"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { siteContent } from "@/data/site-content";
import { cn } from "@/lib/utils";

const navigationLinks = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Tours",
    href: "/tours",
  },
  {
    label: "Nosotros",
    href: "/nosotros",
  },
  {
    label: "Galería",
    href: "/galeria",
  },
  {
    label: "Preguntas",
    href: "/preguntas-frecuentes",
  },
  {
    label: "Contacto",
    href: "/contacto",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07130f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={closeMenu}
          aria-label="Ir al inicio de Ruticas RD"
        >
          <div className="relative h-13 w-13 overflow-hidden rounded-full bg-white shadow-lg">
            <Image
              src="/images/brand/logo-ruticas.png"
              alt="Logo de Ruticas RD"
              fill
              sizes="52px"
              className="object-contain p-0.5"
            />
          </div>

          <div>
            <p className="text-base font-extrabold tracking-wide text-white sm:text-lg">
              {siteContent.brand.name}
            </p>

            <p className="hidden text-xs font-medium tracking-wide text-white/60 sm:block">
              {siteContent.brand.slogan}
            </p>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Navegación principal"
        >
          {navigationLinks.map((link) => {
            const isActive = isActiveRoute(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-bold transition-colors",
                  isActive
                    ? "text-lime-300"
                    : "text-white hover:text-lime-300",
                )}
              >
                {link.label}

                {isActive && (
                  <span className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-5 rounded-full bg-lime-300" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/tours"
            className="inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-3 text-sm font-extrabold text-[#07130f] transition hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2 focus:ring-offset-[#07130f]"
          >
            Reservar aventura
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setIsMenuOpen((currentState) => !currentState)}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-[#07130f] px-5 pb-6 pt-4 lg:hidden"
        >
          <nav
            className="mx-auto flex max-w-7xl flex-col"
            aria-label="Navegación móvil"
          >
            {navigationLinks.map((link) => {
              const isActive = isActiveRoute(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "rounded-xl px-4 py-3.5 text-base font-semibold transition",
                    isActive
                      ? "bg-lime-400/10 text-lime-300"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/tours"
              onClick={closeMenu}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-3.5 font-extrabold text-[#07130f]"
            >
              Reservar aventura
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}