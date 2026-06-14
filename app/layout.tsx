import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { getServerSession } from "next-auth";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import ClientEffects from "@/components/ClientEffects";
import { authOptions } from "@/lib/auth/options";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vexel.vercel.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display family for the portfolio surface (scoped via .pf-display).
// Distinctive grotesque, self-hosted by next/font (served from 'self', so it
// loads under the project CSP — unlike the external Fontshare @import).
const bricolage = Bricolage_Grotesque({
  variable: "--font-pf-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vexel | Webs de conversion para negocios ambiciosos",
    template: "%s | Vexel",
  },
  description:
    "Vexel disena y desarrolla landing pages ultramodernas para negocios locales y creativos que quieren vender mas.",
  applicationName: "Vexel",
  keywords: [
    "diseno web",
    "landing page",
    "conversion",
    "agencia digital",
    "web para negocios locales",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "Vexel",
    title: "Vexel | Webs de conversion para negocios ambiciosos",
    description:
      "Vexel disena y desarrolla landing pages ultramodernas para negocios locales y creativos que quieren vender mas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vexel | Webs de conversion para negocios ambiciosos",
    description:
      "Vexel disena y desarrolla landing pages ultramodernas para negocios locales y creativos que quieren vender mas.",
  },
  category: "business",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-body">
        <AuthSessionProvider session={session}>
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>
          {children}
          <ClientEffects />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
