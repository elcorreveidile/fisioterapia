import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import DemoBanner from "@/components/DemoBanner";
import ScrollToTop from "@/components/ScrollToTop";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Eje Fisioterapia | Entiende tu dolor",
  description: "Fisioterapia pedagógica en Granada. Una persona, un fisio, una hora. Sales tratado y sabiendo qué hacer.",
  keywords: ["fisioterapia", "Granada", "fisioterapeuta", "dolor", "rehabilitación", "tratamiento"],
  authors: [{ name: "Eje Fisioterapia" }],
  openGraph: {
    title: "Eje Fisioterapia | Entiende tu dolor",
    description: "Fisioterapia pedagógica en Granada. Una persona, un fisio, una hora.",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/images/logo.png",
        width: 1536,
        height: 1024,
        alt: "Eje Fisioterapia",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ScrollToTop />
        <DemoBanner />
      </body>
    </html>
  );
}
