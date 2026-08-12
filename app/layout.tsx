import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";

import SiteChrome from "@/components/layout/SiteChrome";

import "./globals.css";

const montserrat = localFont({
  src: "./fonts/montserrat-latin.woff2",
  variable: "--font-montserrat",
  display: "swap",
  weight: "100 900",
  style: "normal",
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
