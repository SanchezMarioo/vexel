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

function normalizeSiteUrl(value: string): string {
  try {
    const url = new URL(value);

    if (url.hostname === "xync.es") {
      url.hostname = "www.xync.es";
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
}

export const siteUrl =
  RAW &&
  (RAW.startsWith("https://") ||
    (process.env.NODE_ENV !== "production" && RAW.startsWith("http://")))
    ? normalizeSiteUrl(RAW)
    : FALLBACK;

export function toAbsoluteUrl(path: string = "/"): string {
  if (typeof path !== "string" || path.length === 0) {
    return siteUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return normalizeSiteUrl(path);
  }

  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
