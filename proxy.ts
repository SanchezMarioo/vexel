import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos las rutas del panel de leads (/admin/leads/*)
// /admin/login es pública y /admin redirige según la sesión activa
const isProtectedAdminRoute = createRouteMatcher(["/admin/leads(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Omite archivos estáticos e internos de Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Siempre intercepta rutas API
    "/(api|trpc)(.*)",
  ],
};
