import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Rutas privadas que ningún crawler debe rastrear ni indexar (admin, studio, API, auth).
const disallow = [
  "/admin",
  "/admin/",
  "/studio",
  "/studio/",
  "/api/",
  "/auth/",
  "/cuenta/",
  "/login",
  "/sign-in",
  "/sign-up",
];

/**
 * Crawlers de IA y de buscadores con IA a los que permitimos EXPLÍCITAMENTE el
 * acceso al contenido público. La regla `*` ya los cubriría, pero una sección por user-agent es una
 * señal inequívoca de intención en el ORIGEN: queremos que ChatGPT, Claude,
 * Perplexity, Gemini, Google y Bing puedan rastrear y citar el sitio público,
 * bloqueando siempre los paneles privados.
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
