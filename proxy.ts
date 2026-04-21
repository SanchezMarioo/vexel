import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PATHS = ["/cuenta", "/api/account"];
const AUTH_PATHS = ["/auth/login", "/auth/register"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = Boolean(token?.userId ?? token?.sub);

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

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/cuenta/:path*", "/api/account/:path*", "/auth/login", "/auth/register"],
};
