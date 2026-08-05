import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog/getPosts";
import { getServices } from "@/lib/services/getServices";
import { projects } from "@/lib/portfolio/content";
import { siteUrl } from "@/lib/site-url";

// Misma cadencia que el blog: los artículos nuevos entran en el sitemap sin
// redeployar (tag "blog" del webhook + red horaria).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPosts();
  const services = await getServices();

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/proyectos/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    // La fecha real del artículo (o su última revisión), no la del deploy.
    lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteUrl}/${service.slug}`,
    lastModified: service.updatedAt ? new Date(service.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/proyectos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/landing-pages-negocios-locales`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...projectRoutes,
    ...serviceRoutes,
    ...blogRoutes,
  ];
}
