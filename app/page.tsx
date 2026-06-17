import type { Metadata } from "next";
import Contact from "@/components/portfolio/Contact";
import Faq from "@/components/portfolio/Faq";
import Footer from "@/components/portfolio/Footer";
import Hero from "@/components/portfolio/Hero";
import Nav from "@/components/portfolio/Nav";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import Process from "@/components/portfolio/Process";
import Projects from "@/components/portfolio/Projects";
import Services from "@/components/portfolio/Services";
import Testimonials from "@/components/portfolio/Testimonials";
import { identity, isRealUrl } from "@/lib/portfolio/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.xync.es";

const title = `${identity.name} · Desarrollador web freelance`;
const description =
  "Desarrollo y mejoro la web y el producto digital de tu negocio: rápido, sin fallos y con plazos cerrados. Cuéntame tu proyecto y te respondo en menos de 24 h.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    locale: "es_ES",
    url: siteUrl,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const sameAs = identity.socials
  .map((social) => social.href)
  .filter((href) => isRealUrl(href));

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: identity.name,
  jobTitle: "Desarrollador web freelance",
  url: siteUrl,
  email: identity.email,
  image: `${siteUrl}/opengraph-image`,
  ...(sameAs.length > 0 ? { sameAs } : {}),
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${identity.name} — Desarrollo web freelance`,
  url: siteUrl,
  email: identity.email,
  image: `${siteUrl}/opengraph-image`,
  areaServed: "ES",
  serviceType: "Desarrollo web y de producto digital",
  inLanguage: "es",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <PortfolioShell>
        <Nav />
        <main id="main-content" tabIndex={-1} aria-label="Contenido principal">
          <Hero />
          <Services />
          <Process />
          <Projects />
          <Testimonials />
          <Faq />
          <Contact />
        </main>
        <Footer />
      </PortfolioShell>
    </>
  );
}
