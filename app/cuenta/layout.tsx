import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccountNav from "@/components/account/AccountNav";
import LogoutButton from "@/components/auth/LogoutButton";
import { requireSessionUser } from "@/lib/auth/service";
import { findUserById } from "@/lib/data/users";

// Portal privado deshabilitado: estas páginas no se usan. Para reactivarlas,
// elimina el `notFound()` de abajo (y reactiva el bloqueo de API en proxy.ts).
const PORTAL_DISABLED = true;

export const metadata: Metadata = {
  title: {
    default: "Area personal",
    template: "%s | Area personal",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (PORTAL_DISABLED) notFound();

  const currentUser = await requireSessionUser("/cuenta");
  const persistedUser = await findUserById(currentUser.id);
  const displayName = persistedUser?.name ?? currentUser.name ?? "usuario";
  const displayEmail = persistedUser?.email ?? currentUser.email;

  return (
    <main id="main-content" tabIndex={-1} aria-label="Area personal" className="relative min-h-screen px-4 py-24 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#7B61FF20_0%,transparent_36%),radial-gradient(circle_at_90%_20%,#2b95ff1d_0%,transparent_40%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="vx-glass-card flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/12 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Area personal</p>
            <h1 className="font-display text-2xl text-white">Hola, {displayName}</h1>
            <p className="text-sm text-white/60">{displayEmail}</p>
          </div>

          <LogoutButton />
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="vx-glass-card h-fit rounded-3xl border border-white/12 p-4">
            <AccountNav />
          </aside>

          <section className="vx-glass-card rounded-3xl border border-white/12 p-5 sm:p-7">{children}</section>
        </div>
      </div>
    </main>
  );
}