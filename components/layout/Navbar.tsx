"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { siteContent } from "@/data/site-content";
import { cn } from "@/lib/utils";

const navigationLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Galería", href: "/galeria" },
  { label: "Preguntas", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="safe-top fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-[#07130f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-12 touch-manipulation items-center gap-2.5 rounded-xl sm:gap-3"
          aria-label="Ir al inicio de Ruticas RD"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white shadow-lg sm:h-13 sm:w-13">
            <Image
              src="/images/brand/logo-ruticas.png"
              alt="Logo de Ruticas RD"
              fill
              sizes="52px"
              className="object-contain p-0.5"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-wide text-white sm:text-lg">
              {siteContent.brand.name}
            </p>
            <p className="hidden text-xs font-medium tracking-wide text-white/60 sm:block">
              {siteContent.brand.slogan}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
          {navigationLinks.map((link) => {
            const isActive = isActiveRoute(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex min-h-11 touch-manipulation items-center py-2 text-sm font-bold transition-colors",
                  isActive ? "text-lime-300" : "text-white hover:text-lime-300",
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
            className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-full bg-lime-400 px-6 py-3 text-sm font-extrabold text-[#07130f] transition hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2 focus:ring-offset-[#07130f]"
          >
            Reservar aventura
          </Link>
        </div>

        <button
          type="button"
          className="tap-target inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition active:scale-95 active:bg-white/15 lg:hidden"
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
          className="safe-bottom overflow-y-auto overscroll-contain border-t border-white/10 bg-[#07130f] px-4 pt-3 lg:hidden"
          style={{
            maxHeight: "calc(100dvh - 5rem - env(safe-area-inset-top, 0px))",
          }}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Navegación móvil">
            {navigationLinks.map((link) => {
              const isActive = isActiveRoute(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex min-h-12 touch-manipulation items-center rounded-2xl px-4 py-3 text-base font-semibold transition active:scale-[0.99]",
                    isActive
                      ? "bg-lime-400/10 text-lime-300"
                      : "text-white/80 active:bg-white/10",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/tours"
              onClick={() => setIsMenuOpen(false)}
              className="mt-3 inline-flex min-h-14 touch-manipulation items-center justify-center rounded-full bg-lime-400 px-6 py-3.5 font-extrabold text-[#07130f] active:scale-[0.98] active:bg-lime-300"
            >
              Reservar aventura
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
