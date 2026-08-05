import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import Navbar from "@/components/layout/Navbar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}