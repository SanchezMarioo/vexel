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
    // Mostramos pantalla explicativa con botón de SignOut para evitar loops infinitos de redirección
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

        <div className="w-full max-w-md p-6 rounded-xl bg-[#0c0c0c] border border-amber-500/30 text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-base font-semibold text-white pf-display">
            Acceso no autorizado
          </h2>

          <p className="text-xs text-white/70 pf-mono leading-relaxed">
            Has iniciado sesión con el correo{" "}
            <strong className="text-white">{userEmail || "desconocido"}</strong>, pero este correo no está en la lista de administradores permitidos.
          </p>

          <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-[11px] text-white/60 pf-mono text-left space-y-1.5">
            <div className="text-white font-medium">💡 ¿Cómo permitir este correo?</div>
            <div>Añádelo en tu archivo <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded">.env.local</code>:</div>
            <div className="text-white/90 bg-black/60 p-2 rounded border border-white/10 select-all font-mono text-[10px] break-all">
              ADMIN_EMAILS={userEmail || "tu-correo@gmail.com"}
            </div>
          </div>

          <div className="pt-2">
            <SignOutButton redirectUrl="/admin/login">
              <button
                type="button"
                className="w-full px-4 py-2.5 rounded-lg bg-white text-black text-xs font-semibold pf-mono hover:bg-white/90 transition-colors cursor-pointer shadow-sm"
              >
                Cerrar sesión e iniciar con otra cuenta
              </button>
            </SignOutButton>
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
              card: "bg-[#0c0c0c] border border-white/10 shadow-2xl rounded-lg text-white",
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
