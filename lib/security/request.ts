export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
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
