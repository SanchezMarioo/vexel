import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";

function isAuthRoute(pathname: string) {
  return pathname === "/auth/login" || pathname === "/auth/register";
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  const callbackUrl = sanitizeCallbackUrl(`${request.nextUrl.pathname}${request.nextUrl.search}`, "/cuenta");
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = Boolean(token?.userId ?? token?.sub);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/cuenta") && !isAuthenticated) {
    return buildLoginRedirect(request);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/cuenta", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cuenta/:path*", "/auth/login", "/auth/register"],
};