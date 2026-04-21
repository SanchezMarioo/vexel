import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function isAuthRoute(pathname: string) {
  return pathname === "/auth/login" || pathname === "/auth/register";
}

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = Boolean(token?.userId ?? token?.sub);
  const { pathname } = request.nextUrl;

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/login", "/auth/register"],
};