import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * El middleware de Clerk SOLO corre en /admin: es la única zona que usa
 * sesión (`auth()` en páginas y Server Actions). Las páginas públicas no
 * tocan Clerk; ejecutarlo ahí forzaba un handshake de redirección con
 * accounts.dev en cada visita (~0.9s extra antes del HTML) y generaba una
 * cadena de redirects que penalizaba LCP/FCP en todo el sitio.
 *
 * Nota: los Route Handlers (/api/*) tampoco usan Clerk, así que quedan fuera.
 */
export default clerkMiddleware();

export const config = {
  matcher: ["/admin/:path*"],
};
