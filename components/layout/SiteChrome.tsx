"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import Navbar from "@/components/layout/Navbar";

interface SiteChromeProps {
  children: ReactNode;
}

export default function SiteChrome({
  children,
}: SiteChromeProps) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />

      {children}

      <Footer />

      <FloatingWhatsApp />
    </>
  );
}