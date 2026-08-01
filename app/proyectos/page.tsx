import type { Metadata } from "next";
import Footer from "@/components/portfolio/Footer";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import ProjectsIndex from "@/components/portfolio/ProjectsIndex";
import SubHeader from "@/components/portfolio/SubHeader";
import { projects } from "@/lib/portfolio/content";
import { siteUrl } from "@/lib/site-url";

const pagePath = "/proyectos";
const pageTitle = "Proyectos · Xync — Desarrollo web Salamanca";
const pageDescription =
  "Casos reales de webs y tiendas online construidas por Xync en Salamanca: ecommerce, restaurantes y productos digitales con resultados medibles.";

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pagePath },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Xync",
    url: `${siteUrl}${pagePath}`,
    title: pageTitle,
    description: pageDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

// CollectionPage con ItemList de los proyectos + BreadcrumbList. Da estructura
// citable a los motores de IA y contexto de navegación a Google (sin depender
// del rich result de FAQ, retirado). El detalle de cada proyecto emite su
// propio CreativeWork.
const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${siteUrl}${pagePath}#collection`,
  name: pageTitle,
  description: pageDescription,
  url: `${siteUrl}${pagePath}`,
  inLanguage: "es",
  isPartOf: { "@id": `${siteUrl}/#website` },
  about: { "@id": `${siteUrl}/#business` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: `${siteUrl}${pagePath}/${project.slug}`,
      name: project.title,
    })),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
    {
      "@type": "ListItem",
      position: 2,
      name: "Proyectos",
      item: `${siteUrl}${pagePath}`,
    },
  ],
};

export default function ProyectosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <PortfolioShell>
        <SubHeader />
        <main id="main-content" tabIndex={-1} aria-label="Proyectos">
          <ProjectsIndex />
        </main>
        <Footer />
      </PortfolioShell>
    </>
  );
}
