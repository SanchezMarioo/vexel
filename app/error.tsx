"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-pf-bg px-6 text-center text-pf-ink">
      <h1 className="font-display text-3xl font-semibold text-pf-ink-strong">Algo ha ido mal</h1>
      <p className="max-w-md text-pf-muted">
        Ha ocurrido un error inesperado. Inténtalo de nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full border border-pf-ink bg-pf-ink px-6 py-3 font-medium text-pf-bg transition-transform duration-150 hover:bg-pf-bg hover:text-pf-ink active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Reintentar
      </button>
    </main>
  );
}
