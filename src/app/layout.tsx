import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

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
  title: "Eje Fisioterapia | Entiende tu dolor",
  description: "Fisioterapia pedagógica en Granada. Una persona, un fisio, una hora. Sales tratado y sabiendo qué hacer.",
  keywords: ["fisioterapia", "Granada", "fisioterapeuta", "dolor", "rehabilitación", "tratamiento"],
  authors: [{ name: "Eje Fisioterapia" }],
  openGraph: {
    title: "Eje Fisioterapia | Entiende tu dolor",
    description: "Fisioterapia pedagógica en Granada. Una persona, un fisio, una hora.",
    type: "website",
    locale: "es_ES",
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
        <DemoBanner />
      </body>
    </html>
  );
}

function DemoBanner() {
  return (
    <div className="demo-banner">
      Clínica ficticia — proyecto demo del catálogo{" "}
      <a href="https://por2duros.com" target="_blank" rel="noopener noreferrer">
        Por 2 Duros
      </a>
    </div>
  );
}
