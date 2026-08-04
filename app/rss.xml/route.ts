import { getPosts } from "@/lib/blog/getPosts";
import { identity } from "@/lib/portfolio/content";
import { siteUrl } from "@/lib/site-url";

/**
 * RSS 2.0 del blog, servido desde la capa de datos (Sanity, con fallback al
 * contenido local). Lo consumen lectores de feeds y, cada vez más,
 * herramientas de IA que monitorizan publicaciones nuevas.
 */

// ISR como el resto del blog: los artículos nuevos entran en el feed sin
// redeployar (tag "blog" del webhook + red horaria).
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPosts();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(`${post.publishedAt}T00:00:00Z`).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog · ${escapeXml(identity.name)}</title>
    <link>${siteUrl}/blog</link>
    <description>Artículos sobre desarrollo web, SEO local y rendimiento, escritos desde proyectos reales en Salamanca.</description>
    <language>es</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
