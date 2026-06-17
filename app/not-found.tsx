import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-pf-bg px-6 text-center text-pf-ink">
      <p className="font-display text-8xl font-bold text-pf-ink-strong">404</p>
      <h1 className="font-display text-3xl font-semibold text-pf-ink-strong">Esta página no existe</h1>
      <p className="max-w-md text-pf-muted">
        Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <Link
        href="/"
        className="rounded-full border border-pf-ink bg-pf-ink px-6 py-3 font-medium text-pf-bg transition-transform duration-150 hover:bg-pf-bg hover:text-pf-ink active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
