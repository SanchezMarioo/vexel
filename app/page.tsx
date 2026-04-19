import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Projects from "@/components/Projects";
import Pricing from "@/components/Pricing";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import BackgroundLayers from "@/components/BackgroundLayers";
import { faqs } from "@/lib/content/faqs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vexel.vercel.app";

const homeTitle = "Landing Pages para Negocios Locales que Convierten | Vexel";
const homeDescription =
  "Disenamos landing pages para negocios locales orientadas a captar mas contactos y ventas. Estrategia, copy, diseno y desarrollo en 14 dias.";

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: [
    "diseno landing pages negocios locales",
    "agencia landing pages",
    "landing page conversion",
    "diseno web para servicios",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: siteUrl,
    type: "website",
    locale: "es_ES",
    siteName: "Vexel",
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}#organization`,
  name: "Vexel",
  url: siteUrl,
  areaServed: "ES",
  serviceType: "Diseno y desarrollo de landing pages",
  inLanguage: "es",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vexel",
  url: siteUrl,
  inLanguage: "es",
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Diseno y desarrollo de landing pages para negocios locales",
  serviceType: "Diseno web orientado a conversion",
  provider: {
    "@id": `${siteUrl}#organization`,
  },
  areaServed: "ES",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "390",
    highPrice: "2400",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <BackgroundLayers />
      <main
        id="main-content"
        tabIndex={-1}
        aria-label="Contenido principal"
        className="relative z-10 flex flex-col overflow-x-clip bg-background"
      >
        <Nav />
        <Hero />
        <Metrics />
        {/* <Projects /> */}
        {/* <Pricing /> */}
        {/* <About /> */}
        {/* <Testimonials /> */}
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}
