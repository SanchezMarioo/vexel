import type { Metadata } from "next";
import { draftMode } from "next/headers";
import BlogIndex from "@/components/blog/BlogIndex";
import Footer from "@/components/portfolio/Footer";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import SubHeader from "@/components/portfolio/SubHeader";
import { getFeaturedPost } from "@/lib/blog/getFeaturedPost";
import { toAbsoluteUrl } from "@/lib/site-url";
import { getOgImageMetadata } from "@/lib/seo/getOgImage";

const pagePath = "/blog";
const pageTitle = "Blog · Xync — Desarrollo web y SEO en Salamanca";
const pageDescription =
  "Artículos sobre desarrollo web, SEO local y rendimiento, escritos desde proyectos reales en Salamanca.";

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pagePath },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Xync",
    url: toAbsoluteUrl(pagePath),
    title: pageTitle,
    description: pageDescription,
    images: [getOgImageMetadata(undefined, pageTitle)],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [getOgImageMetadata(undefined, pageTitle).url],
  },
};

// ISR: red de seguridad horaria; la invalidación inmediata al publicar la
// hace el webhook de Sanity (tag "blog", ver /api/revalidate/sanity).
export const revalidate = 3600;

// Blog como entidad del grafo de Xync (publisher: #business) + BreadcrumbList.
// Cada artículo emite su propio BlogPosting en /blog/[slug].
const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${toAbsoluteUrl(pagePath)}#blog`,
  name: pageTitle,
  description: pageDescription,
  url: toAbsoluteUrl(pagePath),
  inLanguage: "es",
  isPartOf: { "@id": `${toAbsoluteUrl("/")}#website` },
  publisher: { "@id": `${toAbsoluteUrl("/")}#business` },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: toAbsoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Blog", item: toAbsoluteUrl(pagePath) },
  ],
};

export default async function BlogPage() {
  const { isEnabled: preview } = await draftMode();
  const { featured, rest } = await getFeaturedPost(preview);
  // BlogIndex espera el destacado primero; el orden llega resuelto de la capa
  // de datos (featured del CMS o, en su defecto, el más reciente).
  const posts = featured ? [featured, ...rest] : rest;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogJsonLd).replace(/</g, "\\u003c"),
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
        <main id="main-content" tabIndex={-1} aria-label="Blog">
          <BlogIndex posts={posts} />
        </main>
        <Footer />
      </PortfolioShell>
    </>
  );
}
