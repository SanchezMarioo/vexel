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
import { identity } from "@/lib/portfolio/content";
import { siteUrl } from "@/lib/site-url";

const title = `Desarrollador web freelance en Salamanca | ${identity.name}`;
const description =
  "Desarrollo y mejoro webs, tiendas online y productos digitales en Salamanca y toda España: rápido, sin fallos y con precio y plazo cerrados. Te respondo en menos de 24 h.";

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

export default function Home() {
  return (
    <>
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
