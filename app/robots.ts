import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Rutas privadas que ningún crawler debe indexar (paneles, API, auth, cuenta).
const disallow = ["/api/", "/auth/", "/cuenta/", "/admin/", "/studio/"];

/**
 * Crawlers de IA y de buscadores con IA a los que permitimos EXPLÍCITAMENTE el
 * acceso. La regla `*` ya los cubriría, pero una sección por user-agent es una
 * señal inequívoca de intención en el ORIGEN: queremos que ChatGPT, Claude,
 * Perplexity, Gemini, Google y Bing puedan rastrear y citar el sitio.
 *
 * IMPORTANTE: si el sitio se sirve tras Cloudflare con "Block AI bots" / AI
 * Audit activado, Cloudflare AÑADE sus propias reglas `Disallow: /` a este
 * robots y, además, su WAF devuelve HTTP 403 a bots como OAI-SearchBot o
 * PerplexityBot. Eso NO se arregla aquí, sino en el panel de Cloudflare
 * (Scrape Shield / AI Crawl Control). Ver AUDIT-REPORT.md → acción externa nº1.
 */
const aiAndSearchBots = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiAndSearchBots, allow: "/", disallow },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
