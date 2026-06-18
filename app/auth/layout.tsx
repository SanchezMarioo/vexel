import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Portal privado deshabilitado: login/registro no se usan. Para reactivarlos,
// elimina el `notFound()` de abajo (y reactiva el bloqueo de API en proxy.ts).
const PORTAL_DISABLED = true;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  if (PORTAL_DISABLED) notFound();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      aria-label="Autenticacion"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-14"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#7B61FF30_0%,transparent_46%),radial-gradient(circle_at_20%_80%,#2b95ff22_0%,transparent_40%)]" />
      <div className="relative z-10 w-full max-w-xl">{children}</div>
    </main>
  );
}