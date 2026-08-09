"use client";

import { usePathname } from "next/navigation";

import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  const shouldHide =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/reservar/") ||
    pathname.startsWith("/reserva/confirmacion/");

  if (shouldHide) {
    return null;
  }

  return <WhatsAppButton />;
}