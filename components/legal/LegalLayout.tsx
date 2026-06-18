import Link from "next/link";
import type { ReactNode } from "react";
import PortfolioShell from "@/components/portfolio/PortfolioShell";

/**
 * Envoltorio común para las páginas legales (Aviso Legal, Privacidad, Cookies).
 * Reutiliza la superficie clara `.pf-root` del portfolio para mantener la marca.
 */
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PortfolioShell>
      <main className="relative z-10 bg-pf-bg px-4 pb-24 pt-36 md:px-6">
        <article className="mx-auto w-full max-w-3xl">
          <Link
            href="/"
            className="pf-mono text-xs uppercase tracking-wide text-pf-muted underline-offset-4 hover:underline"
          >
            ← Volver al inicio
          </Link>
          <h1 className="pf-display mt-6 text-4xl leading-tight text-pf-ink-strong md:text-5xl">
            {title}
          </h1>
          <p className="pf-mono mt-3 text-xs uppercase tracking-wide text-pf-muted">
            Última actualización: {updated}
          </p>
          <div className="mt-10">{children}</div>
        </article>
      </main>
    </PortfolioShell>
  );
}

/** Sección legal con encabezado y cuerpo en prosa. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="pf-display text-2xl text-pf-ink-strong">{title}</h2>
      <div className="pf-prose mt-4 space-y-4 leading-relaxed text-pf-ink-soft">
        {children}
      </div>
    </section>
  );
}
