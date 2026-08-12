import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminProfile } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Acceso administrativo",
  description: "Acceso privado al panel administrativo de Ruticas RD.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const admin = await getAdminProfile();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-[#07130f] px-4 py-10 sm:px-6">
      <div className="absolute inset-0 opacity-25">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#0f5132] blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-lime-400/30 blur-3xl" />
      </div>

      <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl shadow-black/35 sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Volver al sitio de Ruticas RD"
            className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border border-[#dce5df] text-[#294238] transition active:bg-[#eef3f0] sm:hover:bg-[#eef3f0]"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-[#eef3f0] bg-white shadow-md">
            <Image
              src="/images/brand/logo-ruticas.png"
              alt="Logo de Ruticas RD"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f1eb] text-[#0f5132]">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
        </div>

        <div className="mt-7 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
            Área privada
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#14231c]">
            Panel administrativo
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#667a70]">
            Ingresa con la cuenta autorizada para administrar Ruticas RD.
          </p>
        </div>

        <AdminLoginForm />

        <p className="mt-6 text-center text-xs leading-5 text-[#7b8d84]">
          El acceso está restringido a administradores activos.
        </p>
      </section>
    </main>
  );
}
