import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Footer from "@/components/portfolio/Footer";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import SubHeader from "@/components/portfolio/SubHeader";
import ServiceDetail from "@/components/services/ServiceDetail";
import { getService } from "@/lib/services/getService";
import { getServices } from "@/lib/services/getServices";
import { siteUrl, toAbsoluteUrl } from "@/lib/site-url";
import { getOgImageMetadata } from "@/lib/seo/getOgImage";

type Params = { slug: string };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const services = await getServices();
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) return { title: "Página no encontrada" };

  const title = service.seoTitle ?? service.title;
  const description = service.metaDescription;
  const pagePath = `/${service.slug}`;
  const image = getOgImageMetadata(service.ogImage, title);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: "Xync",
      url: toAbsoluteUrl(pagePath),
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const service = await getService(slug, preview);

  if (!service) notFound();

  const pageUrl = toAbsoluteUrl(`/${service.slug}`);
  const social = getOgImageMetadata(service.ogImage, service.title);
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: service.title,
    description: service.metaDescription,
    url: pageUrl,
    provider: { "@id": `${siteUrl}/#business` },
    mainEntityOfPage: pageUrl,
    image: social.url,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: toAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: service.title, item: pageUrl },
    ],
  };
  const faqJsonLd = service.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  } : null;

  return (
    <>
      {[serviceJsonLd, breadcrumbJsonLd, ...(faqJsonLd ? [faqJsonLd] : [])].map((data, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
      ))}
      <PortfolioShell>
        <SubHeader />
        <main id="main-content" tabIndex={-1} aria-label={service.title}>
          <article><ServiceDetail service={service} /></article>
        </main>
        <Footer />
      </PortfolioShell>
    </>
  );
}
