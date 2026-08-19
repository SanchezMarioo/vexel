import { identity } from "@/lib/portfolio/content";
import Button from "./ui/Button";
import ImageSlot from "./ui/ImageSlot";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-pf-bg">
      <div className="pf-container relative grid items-center gap-12 pb-20 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="lg:col-span-6">
          <h1
            className="pf-display text-pf-ink-strong"
            style={{ fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)" }}
          >
            {identity.headline}
          </h1>

          <p className="pf-prose mt-6 text-lg leading-relaxed text-pf-ink">
            {identity.subhead}
          </p>

          <p className="mt-4 text-base text-pf-ink-soft">
            Xync es un estudio de desarrollo y diseño web freelance en{" "}
            {identity.location}. Trabajamos para toda España y Latinoamérica en
            remoto.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              href="/empezar"
              variant="solid"
              size="lg"
              withArrow
              aria-label="Cuéntanos tu proyecto para empezar"
            >
              Cuéntanos tu proyecto
            </Button>
            <Button
              href="#proyectos"
              variant="outline"
              size="lg"
              aria-label="Ver casos reales de proyectos"
            >
              Ver casos reales
            </Button>
          </div>
        </div>

        {/* Visual: el resultado que entrego, no el código. */}
        <div className="relative lg:col-span-6">
          <div className="group overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface shadow-[0_8px_30px_-15px_oklch(0_0_0/0.12)] transition-shadow duration-300 hover:shadow-[0_20px_45px_-18px_oklch(0_0_0/0.2)]">
            <div className="flex items-center gap-2 border-b border-pf-line bg-[oklch(0.93_0_0)] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0_0)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0_0)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0_0)]" />
              <Link
                href="https://lumen.xync.es/"
                target="_blank"
                rel="noreferrer noopener"
                className="pf-mono ml-3 truncate rounded-[var(--pf-radius-sm)] bg-pf-subtle px-3 py-1 text-xs text-pf-muted transition-colors hover:text-pf-ink"
              >
                lumen.xync.es
              </Link>
            </div>
            <div className="overflow-hidden">
              <ImageSlot
                priority
                sizes="(min-width: 1024px) 580px, 100vw"
                image={{
                  src: "/portfolio/hero-images.webp",
                  alt: "Tienda online de muebles Lumen, desarrollada por Xync, estudio de desarrollo web en Salamanca",
                  width: 1200,
                  height: 820,
                }}
              />
            </div>
          </div>

          <div className="absolute -bottom-4 -left-2 flex items-center gap-2.5 rounded-[var(--pf-radius)] border border-pf-line bg-pf-bg px-4 py-3 shadow-[0_12px_28px_-10px_oklch(0_0_0_/_0.25)] transition-transform duration-200 hover:-translate-y-0.5 sm:-left-5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-pf-ink text-pf-bg">
              <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>
            </span>
            <span className="text-sm font-medium text-pf-ink">
              Precio y plazo cerrados antes de empezar
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
