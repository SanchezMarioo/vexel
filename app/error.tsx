"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-white">
      <h1 className="font-display text-3xl font-semibold">Algo ha ido mal</h1>
      <p className="max-w-md text-white/60">
        Ha ocurrido un error inesperado. Inténtalo de nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-[#7b61ff] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6a50f0]"
      >
        Reintentar
      </button>
    </main>
  );
}
