/**
 * URL canónica del sitio, en un solo lugar.
 *
 * Endurecida contra un `NEXT_PUBLIC_SITE_URL` mal configurado: si la variable
 * (que se *inlinea en build*) llega como `http://localhost:3000` en producción
 * —como ocurría en Vercel— rompería el canonical, el og:image y TODO el JSON-LD.
 * Aquí solo aceptamos una URL https; en desarrollo permitimos http://localhost.
 *
 * Importa SIEMPRE `siteUrl` desde aquí (layout, page, sitemap, robots, schema…)
 * en vez de leer la env var suelta, para que la protección sea consistente.
 */
const RAW = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const FALLBACK = "https://www.xync.es";

export const siteUrl =
  RAW &&
  (RAW.startsWith("https://") ||
    (process.env.NODE_ENV !== "production" && RAW.startsWith("http://")))
    ? RAW
    : FALLBACK;
