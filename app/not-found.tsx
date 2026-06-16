import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-white">
      <p className="font-display text-7xl font-bold text-[#7b61ff]">404</p>
      <h1 className="font-display text-3xl font-semibold">Esta página no existe</h1>
      <p className="max-w-md text-white/60">
        Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#7b61ff] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6a50f0]"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
