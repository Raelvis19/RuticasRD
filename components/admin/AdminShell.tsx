import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardList,
  ReceiptText,
  Images,
  LayoutDashboard,
  LogOut,
  Map,
  PlusCircle,
} from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import type { AdminProfile } from "@/lib/auth/admin";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Tours", href: "/admin/tours", icon: Map },
  { label: "Galería", href: "/admin/galeria", icon: Images },
  {
    label: "Reservaciones",
    href: "/admin/reservaciones",
    icon: ClipboardList,
  },
  { label: "Gastos", href: "/admin/gastos", icon: ReceiptText },
];

interface AdminShellProps {
  admin: AdminProfile;
  children: ReactNode;
}

export default function AdminShell({ admin, children }: AdminShellProps) {
  const initial = admin.fullName.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-[#f2f6f3] text-[#14231c] lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="hidden min-h-screen flex-col bg-[#07130f] px-5 py-6 text-white print:!hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:min-h-0 lg:self-start lg:overflow-y-auto">
        <Link href="/admin" className="flex items-center gap-3 rounded-2xl">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white">
            <Image
              src="/images/brand/logo-ruticas.png"
              alt="Logo de Ruticas RD"
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-black tracking-wide">Ruticas RD</p>
            <p className="text-xs text-white/55">Administración</p>
          </div>
        </Link>

        <nav className="mt-10 space-y-2" aria-label="Panel administrativo">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/admin/tours/nuevo"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime-400 px-5 py-3 font-black text-[#07130f] transition hover:bg-lime-300"
        >
          <PlusCircle size={19} aria-hidden="true" />
          Crear tour
        </Link>

        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-400 font-black text-[#07130f]">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{admin.fullName}</p>
              <p className="truncate text-xs text-white/50">{admin.email}</p>
            </div>
          </div>

          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={19} aria-hidden="true" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[#dce6e0] bg-white/95 px-4 py-3 backdrop-blur-xl print:!hidden sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <Link href="/admin" className="flex min-w-0 items-center gap-3 lg:hidden">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white shadow-sm">
                <Image
                  src="/images/brand/logo-ruticas.png"
                  alt="Logo de Ruticas RD"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">Ruticas RD</p>
                <p className="text-xs text-[#71847a]">Panel administrativo</p>
              </div>
            </Link>

            <p className="hidden text-sm font-semibold text-[#65786e] lg:block">
              Panel administrativo
            </p>

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-[#dce6e0] text-[#496057] transition active:bg-[#edf3ef] lg:hidden"
              >
                <LogOut size={19} />
              </button>
            </form>
          </div>

          <nav
            className="scrollbar-none mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1 lg:hidden"
            aria-label="Navegación administrativa móvil"
          >
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#edf3ef] px-4 py-2 text-sm font-bold text-[#294238]"
                >
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="px-4 py-6 print:!p-0 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
