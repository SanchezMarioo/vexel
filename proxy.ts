import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth/env";

const PROTECTED_PATHS = ["/cuenta", "/api/account"];
const ADMIN_PATHS = ["/admin", "/api/admin"];
const AUTH_PATHS = ["/auth/login", "/auth/register"];

// Portal privado (cuenta/admin/auth) deshabilitado: no se usa. Sus páginas HTML
// devuelven 404 vía notFound() en sus layouts; aquí bloqueamos sus rutas API.
// Para reactivarlo: pon PORTAL_DISABLED en false y quita los notFound() de los layouts.
const PORTAL_DISABLED = true;
const DISABLED_PORTAL_PATHS = [
  "/cuenta",
  "/admin",
  "/auth",
  "/api/account",
  "/api/admin",
  "/api/auth",
];

function isDisabledPortalPath(pathname: string) {
  return DISABLED_PORTAL_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const isDev = process.env.NODE_ENV !== "production";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseOrigin = (() => {
  try {
    return supabaseUrl ? new URL(supabaseUrl).origin : "https://*.supabase.co";
  } catch {
    return "https://*.supabase.co";
  }
})();

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isAdminPath(pathname: string) {
  return ADMIN_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isHtmlPath(pathname: string) {
  return !pathname.startsWith("/api/");
}

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com ${supabaseOrigin}`,
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss: http://localhost:* http://127.0.0.1:*" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Portal deshabilitado: corta antes de tocar la sesión.
  if (PORTAL_DISABLED && isDisabledPortalPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, message: "No disponible." }, { status: 404 });
    }
    // Deja que el layout de la sección renderice el 404 real de Next.
    return NextResponse.next();
  }

  const secret = getAuthSecret();
  let token = await getToken({ req: request, secret });

  if (!token) {
    token =
      (await getToken({
        req: request,
        secret,
        secureCookie: true,
        cookieName: "__Secure-next-auth.session-token",
      })) ??
      (await getToken({
        req: request,
        secret,
        secureCookie: false,
        cookieName: "next-auth.session-token",
      }));
  }
  const isAuthenticated = Boolean(token?.userId ?? token?.sub);
  const isAdmin = token?.role === "admin";

  // Redirect authenticated users away from login/register pages
  if (isAuthPath(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect authenticated routes
  if (isProtectedPath(pathname) && !isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, message: "No autenticado." },
        { status: 401 },
      );
    }

    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url),
    );
  }

  // Protect admin routes
  if (isAdminPath(pathname)) {
    if (!isAuthenticated) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
      }
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url),
      );
    }

    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (!isHtmlPath(pathname)) {
    return NextResponse.next();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/api/account/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/auth/:path*",
    "/api/auth/:path*",
  ],
};
