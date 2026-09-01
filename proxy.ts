import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const clerkHandler = clerkMiddleware();

/**
 * Proxy de Next.js (middleware):
 * 1. Autenticación Clerk: SOLO corre en `/admin/*` para evitar el handshake
 *    con accounts.dev en páginas públicas y proteger el LCP/FCP global.
 * 2. Negociación de contenido Markdown (`Accept: text/markdown`):
 *    Cuando un agente de IA solicita contenido en markdown (Cloudflare Markdown for Agents,
 *    isitagentready.com, LLMs), reescribe internamente la petición a `/api/markdown`
 *    manteniendo la URL canónica del recurso.
 */
export default function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // 1. Clerk solo corre en /admin: es la única zona que usa sesión
  if (pathname.startsWith("/admin")) {
    return clerkHandler(req, event);
  }

  // 2. Negociación de contenido: Accept: text/markdown para agentes de IA
  const accept = req.headers.get("accept") || "";
  if (
    accept.includes("text/markdown") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/studio")
  ) {
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = "/api/markdown";
    rewriteUrl.searchParams.set("path", pathname);
    return NextResponse.rewrite(rewriteUrl);
  }

  const res = NextResponse.next();
  res.headers.set("Vary", "Accept");
  res.headers.set("Link", `<${pathname}>; rel="alternate"; type="text/markdown"`);
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt)$).*)",
  ],
};

