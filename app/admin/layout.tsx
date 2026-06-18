import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminUser } from "@/lib/auth/service";
import LogoutButton from "@/components/auth/LogoutButton";

// Portal privado deshabilitado: estas páginas no se usan. Para reactivarlas,
// elimina el `notFound()` de abajo (y reactiva el bloqueo de API en proxy.ts).
const PORTAL_DISABLED = true;

export const metadata: Metadata = {
  title: {
    default: "Panel admin",
    template: "%s | Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/solicitudes", label: "Solicitudes" },
  { href: "/admin/proyectos", label: "Proyectos" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (PORTAL_DISABLED) notFound();

  const currentUser = await requireAdminUser();

  return (
    <main id="main-content" tabIndex={-1} aria-label="Panel de administracion" className="relative min-h-screen px-4 py-24 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#7B61FF20_0%,transparent_36%),radial-gradient(circle_at_90%_20%,#2b95ff1d_0%,transparent_40%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="vx-glass-card flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/12 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Panel admin</p>
            <h1 className="font-display text-2xl text-white">Administracion</h1>
            <p className="text-sm text-white/60">{currentUser.email}</p>
          </div>
          <LogoutButton />
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="vx-glass-card h-fit rounded-3xl border border-white/12 p-4">
            <nav aria-label="Navegacion del admin" className="space-y-2">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-white/12 bg-white/2 px-4 py-3 text-sm text-white/75 transition hover:border-white/25 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <section className="vx-glass-card rounded-3xl border border-white/12 p-5 sm:p-7">{children}</section>
        </div>
      </div>
    </main>
  );
}
