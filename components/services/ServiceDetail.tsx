import Image from "next/image";
import Link from "next/link";
import type { ServicePage } from "@/lib/services/mappers";
import PostBody from "@/components/blog/PostBody";
import Button from "@/components/portfolio/ui/Button";
import ServiceFaq from "@/components/services/ServiceFaq";

export default function ServiceDetail({ service }: { service: ServicePage }) {
  const hasHeroImage = Boolean(service.hero?.image);

  return (
    <div className="pf-container pb-24 pt-10 md:pb-32 md:pt-14">
      <nav aria-label="Ruta de navegación" className="pf-mono flex flex-wrap items-center gap-2 text-xs text-pf-muted">
        <Link href="/" className="transition-colors hover:text-pf-ink">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span className="text-pf-ink-soft">{service.title}</span>
      </nav>

      <header
        className={`relative mt-10 max-w-6xl gap-12 border-b border-pf-line pb-16 ${
          hasHeroImage ? "grid md:grid-cols-[1fr_0.8fr] md:items-center md:gap-16 md:pb-24" : "md:pb-28"
        }`}
      >
        <div className={hasHeroImage ? "max-w-3xl" : "max-w-5xl"}>
          <div className="flex items-center gap-3">
            <span className="pf-mono text-[0.68rem] uppercase tracking-[0.16em] text-pf-muted">Servicio</span>
            <span aria-hidden="true" className="h-px w-8 bg-pf-line-strong" />
            {service.hero?.eyebrow ? <p className="pf-mono text-xs text-pf-muted">{service.hero.eyebrow}</p> : null}
          </div>
          <h1
            className={`pf-display mt-4 text-pf-ink-strong ${hasHeroImage ? "max-w-4xl" : "max-w-5xl"}`}
            style={{
              fontSize: hasHeroImage ? "clamp(2.5rem, 6.4vw, 5.5rem)" : "clamp(2.75rem, 8vw, 7rem)",
              letterSpacing: "-0.055em",
              lineHeight: 0.92,
            }}
          >
            {service.hero?.title ?? service.title}
          </h1>
          {service.hero?.text ? (
            <p className={`pf-prose mt-8 text-lg leading-relaxed text-pf-ink-soft md:text-xl ${hasHeroImage ? "max-w-xl" : "max-w-2xl"}`}>
              {service.hero.text}
            </p>
          ) : null}
          <a
            href="#contenido-servicio"
            className="pf-mono group mt-10 inline-flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-pf-ink-soft transition-colors hover:text-pf-ink-strong"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-pf-line-strong transition-transform duration-300 group-hover:translate-y-1">↓</span>
            Descubre el servicio
          </a>
        </div>
        {service.hero?.image ? (
          <figure className="group relative">
            <div className="overflow-hidden rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-bg">
              <Image
                src={service.hero.image.src}
                alt={service.hero.image.alt || service.title}
                width={service.hero.image.width}
                height={service.hero.image.height}
                fetchPriority="high"
                loading="eager"
                sizes="(min-width: 768px) 40vw, 100vw"
                className="h-auto w-full object-cover transition-transform duration-700 ease-[var(--pf-ease-out)] group-hover:scale-[1.025]"
                {...(service.hero.image.blurDataURL ? { placeholder: "blur" as const, blurDataURL: service.hero.image.blurDataURL } : {})}
              />
            </div>
            <figcaption className="pf-mono mt-3 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.12em] text-pf-muted">
              <span>{service.title}</span>
              <span aria-hidden="true">Xync / 01</span>
            </figcaption>
          </figure>
        ) : null}
      </header>

      <div id="contenido-servicio" className="mt-16 max-w-4xl md:mt-20"><PostBody blocks={service.content} /></div>

      {service.faq.length > 0 ? (
        <section aria-labelledby="faq-title" className="mt-20 max-w-4xl border-t border-pf-line pt-14 md:mt-28">
          <h2 id="faq-title" className="pf-display text-3xl text-pf-ink-strong md:text-4xl">Preguntas frecuentes</h2>
          <ServiceFaq items={service.faq} />
        </section>
      ) : null}

      <section
        aria-label="Contacto"
        className="mt-10 max-w-4xl border-t border-pf-line pt-14 md:mt-15"
      >
        <h2 className="pf-display text-3xl text-pf-ink-strong md:text-4xl" style={{ textWrap: "balance" }}>
          {service.cta.title}
        </h2>
        <p className="pf-prose mt-4 text-lg text-pf-ink-soft">{service.cta.text}</p>
        <div className="mt-8"><Button href={service.cta.href} variant="primary" size="lg" withArrow>{service.cta.label}</Button></div>
      </section>
    </div>
  );
}
