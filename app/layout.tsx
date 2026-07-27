import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientEffects from "@/components/ClientEffects";
import StructuredData from "@/components/StructuredData";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display family for the portfolio surface (scoped via .pf-display).
// Distinctive grotesque, self-hosted by next/font (served from 'self', so it
// loads under the project CSP — unlike the external Fontshare @import).
const bricolage = Bricolage_Grotesque({
  variable: "--font-pf-display",
  subsets: ["latin"],
  display: "swap",
});

const defaultTitle = "Xync · Desarrollo y diseño web en Salamanca";
const defaultDescription =
  "Estudio freelance de diseño y desarrollo web en Salamanca: webs, tiendas online y landing pages rápidas y orientadas a conversión, con precio y plazo cerrados.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Xync",
  },
  description: defaultDescription,
  applicationName: "Xync",
  authors: [{ name: "Xync" }],
  creator: "Xync",
  publisher: "Xync",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    siteName: "Xync",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-body">
        <StructuredData />
        {children}
        <ClientEffects />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
