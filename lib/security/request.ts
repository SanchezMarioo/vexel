export function getClientIp(request: Request) {
  // 1. Cabecera inyectada y garantizada por la infraestructura de Vercel (no modificable por el cliente)
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp.split(",")[0]?.trim() || "unknown";
  }

  // 2. Cabecera inyectada y garantizada por Cloudflare Edge
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  // 3. Fallbacks para entornos locales, VPS o proxies donde no exista cabecera de plataforma
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

function getOriginFromHeader(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function hasTrustedOrigin(request: Request) {
  const expectedOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");

  if (origin) {
    return origin === expectedOrigin;
  }

  const refererOrigin = getOriginFromHeader(request.headers.get("referer"));

  if (refererOrigin) {
    return refererOrigin === expectedOrigin;
  }

  return false;
}

export function isJsonContentType(contentType: string | null) {
  if (!contentType) {
    return false;
  }

  return contentType.toLowerCase().includes("application/json");
}
