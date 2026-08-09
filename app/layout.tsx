import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Montserrat } from "next/font/google";

import SiteChrome from "@/components/layout/SiteChrome";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ruticas RD | Excursiones y aventuras",
    template: "%s | Ruticas RD",
  },
  description:
    "Descubre senderos, cascadas, montañas y experiencias inolvidables en República Dominicana junto a Ruticas RD.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07130f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={montserrat.variable}
      suppressHydrationWarning
    >
      <body>
        <SiteChrome>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}