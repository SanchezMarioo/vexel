import type { Metadata } from "next";
import { SignIn, SignOutButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { identity } from "@/lib/portfolio/content";
import { checkIsAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Acceso Admin · Xync",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const { userId } = await auth();

  // Si el usuario ya está autenticado con Clerk, verificamos si está en la lista de administradores
  if (userId) {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "";
    const isAuthorized = checkIsAdmin(userEmail);

    if (isAuthorized) {
      redirect("/admin/leads");
    }

    // Usuario autenticado con Clerk pero NO incluido en ADMIN_EMAILS:
    // Mostramos pantalla profesional y limpia sin revelar detalles de configuración
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="pf-display text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
          >
            {identity.name}
            <span className="text-white">.</span>
          </Link>
          <p className="mt-2 text-xs pf-mono text-muted uppercase tracking-widest">
            Panel de Control
          </p>
        </div>

        <div className="w-full max-w-md p-7 rounded-2xl bg-[#0c0c0c] border border-white/10 text-center space-y-5 shadow-2xl">
          <div className="w-11 h-11 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white pf-display tracking-tight">
              Acceso restringido
            </h2>
            <p className="text-xs text-white/60 pf-mono leading-relaxed">
              La cuenta <strong className="text-white font-medium">{userEmail || "actual"}</strong> no dispone de permisos de administrador.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <SignOutButton redirectUrl="/admin/login">
              <button
                type="button"
                className="w-full px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold pf-mono hover:bg-white/90 transition-colors cursor-pointer shadow-sm"
              >
                Cerrar sesión e iniciar con otra cuenta
              </button>
            </SignOutButton>

            <Link
              href="/"
              className="inline-block text-[11px] pf-mono text-white/40 hover:text-white/70 transition-colors"
            >
              ← Volver al sitio web
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Usuario no autenticado: renderizamos el formulario de Clerk
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="pf-display text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          {identity.name}
          <span className="text-white">.</span>
        </Link>
        <p className="mt-2 text-xs pf-mono text-muted uppercase tracking-widest">
          Dashboard de Leads
        </p>
      </div>

      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path="/admin/login"
          signUpUrl="/admin/login"
          fallbackRedirectUrl="/admin/leads"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#0c0c0c] border border-white/10 shadow-2xl rounded-2xl text-white",
              headerTitle: "text-white pf-display text-xl",
              headerSubtitle: "text-white/60 text-sm",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
              formFieldLabel: "text-white/80 text-xs pf-mono",
              formFieldInput: "bg-[#141414] border-white/15 text-white focus:border-white",
              formButtonPrimary: "bg-white text-black hover:bg-white/90 font-medium transition-colors",
              footerActionLink: "text-white hover:underline",
            },
          }}
        />
      </div>
    </div>
  );
}
