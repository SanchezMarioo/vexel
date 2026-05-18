import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth/env";

const PROTECTED_PATHS = ["/cuenta", "/api/account"];
const ADMIN_PATHS = ["/admin", "/api/admin"];
const AUTH_PATHS = ["/auth/login", "/auth/register"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isAdminPath(pathname: string) {
  return ADMIN_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/api/account/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
