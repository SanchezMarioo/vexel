import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientEffects from "@/components/ClientEffects";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vexel — Webs de conversion para negocios ambiciosos",
  description:
    "Vexel disena y desarrolla landing pages ultramodernas para negocios locales y creativos que quieren vender mas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-body">
        {children}
        <ClientEffects />
      </body>
    </html>
  );
}
