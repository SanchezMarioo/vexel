import Link from "next/link";
import { identity } from "@/lib/portfolio/content";
import Button from "./ui/Button";

/**
 * Cabecera slim para subpáginas del portfolio (/proyectos, /proyectos/[slug]).
 * A diferencia de <Nav>, no observa secciones ni usa anclas locales: sus enlaces
 * son absolutos, así que funciona igual desde cualquier ruta. Sin JS.
 */
export default function SubHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-pf-line bg-pf-bg/85 backdrop-blur-md">
      <nav
        aria-label="Principal"
        className="pf-container flex h-16 items-center justify-between gap-6"
      >
        <Link href="/" className="pf-display text-lg leading-none text-pf-ink">
          {identity.name}
          <span className="text-pf-ink">.</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-[var(--pf-radius-sm)] px-3 py-2 text-sm text-pf-ink-soft transition-colors duration-200 hover:text-pf-ink"
          >
            Inicio
          </Link>
          <Link
            href="/#servicios"
            className="hidden rounded-[var(--pf-radius-sm)] px-3 py-2 text-sm text-pf-ink-soft transition-colors duration-200 hover:text-pf-ink sm:inline-block"
          >
            Servicios
          </Link>
          <Button href="/#contacto" size="sm" variant="ink">
            Hablemos
          </Button>
        </div>
      </nav>
    </header>
  );
}
