import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/portfolio/Footer";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import ProjectDetail from "@/components/portfolio/ProjectDetail";
import SubHeader from "@/components/portfolio/SubHeader";
import {
  getProjectBySlug,
  getProjectNeighbors,
  projects,
  projectSeo,
} from "@/lib/portfolio/content";
import { siteUrl } from "@/lib/site-url";

type Params = { slug: string };

/** Nombre corto de marca del proyecto (sin la coletilla tras "—"). */
function projectName(title: string): string {
  return title.split(" — ")[0] ?? title;
}

export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Proyecto no encontrado" };
  }

  const name = projectName(project.title);
  const title = `${name} · Xync — ${project.sector}`;
  const description = projectSeo[slug] ?? `${project.problem} ${project.result}`;
  const pagePath = `/proyectos/${slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      type: "article",
      locale: "es_ES",
      siteName: "Xync",
      url: `${siteUrl}${pagePath}`,
      title,
      description,
      images: [{ url: project.image.src, alt: project.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.image.src],
    },
  };
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { prev, next } = getProjectNeighbors(slug);
  if (!prev || !next) {
    notFound();
  }

  const pagePath = `/proyectos/${slug}`;
  const name = projectName(project.title);

  // CreativeWork del proyecto: entidad citable que conecta el caso con Xync como
  // creador y con Salamanca como lugar de creación (señal local para IA/Google).
  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description: `${project.problem} ${project.result}`,
    url: `${siteUrl}${pagePath}`,
    image: `${siteUrl}${project.image.src}`,
    inLanguage: "es",
    keywords: project.stack.join(", "),
    about: project.sector,
    creator: {
      "@type": "Organization",
      name: "Xync",
      url: siteUrl,
    },
    locationCreated: {
      "@type": "Place",
      name: "Salamanca, España",
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
        item: `${siteUrl}/proyectos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: `${siteUrl}${pagePath}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(creativeWorkJsonLd).replace(/</g, "\\u003c"),
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
        <main id="main-content" tabIndex={-1} aria-label={name}>
          <ProjectDetail project={project} prev={prev} next={next} />
        </main>
        <Footer />
      </PortfolioShell>
    </>
  );
}
