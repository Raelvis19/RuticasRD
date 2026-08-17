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
  metadataBase: new URL("https://ruticasrd.com"),
  title: {
    default: "Ruticas RD | Excursiones y aventuras",
    template: "%s | Ruticas RD",
  },
  description:
    "Descubre senderos, cascadas, montañas y experiencias inolvidables en República Dominicana junto a Ruticas RD.",
  applicationName: "Ruticas RD",
  icons: {
    icon: [
      { url: "/images/brand/logo-ruticas-icon.png", type: "image/png" },
    ],
    apple: "/images/brand/logo-ruticas-icon.png",
    shortcut: "/images/brand/logo-ruticas-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "/",
    siteName: "Ruticas RD",
    title: "Ruticas RD | Excursiones y aventuras",
    description:
      "Descubre senderos, cascadas, montañas y experiencias inolvidables en República Dominicana junto a Ruticas RD.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Ruticas RD - Explora, conecta y vive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ruticas RD | Excursiones y aventuras",
    description:
      "Descubre senderos, cascadas, montañas y experiencias inolvidables en República Dominicana junto a Ruticas RD.",
    images: ["/opengraph-image"],
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://ruticasrd.com/#organization",
                  name: "Ruticas RD",
                  url: "https://ruticasrd.com",
                  logo: "https://ruticasrd.com/images/brand/logo-ruticas-icon.png",
                  description:
                    "Excursiones, senderismo, naturaleza y aventuras organizadas en República Dominicana.",
                  foundingDate: "2026-08-02",
                  areaServed: { "@type": "Country", name: "República Dominicana" },
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+1-829-390-7333",
                    contactType: "customer service",
                    availableLanguage: "Spanish",
                  },
                  sameAs: ["https://www.instagram.com/ruticasrd"],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://ruticasrd.com/#website",
                  url: "https://ruticasrd.com",
                  name: "Ruticas RD",
                  inLanguage: "es-DO",
                  publisher: { "@id": "https://ruticasrd.com/#organization" },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <SiteChrome>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
