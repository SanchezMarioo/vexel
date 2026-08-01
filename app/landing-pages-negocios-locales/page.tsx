import type { Metadata } from "next";
import EyebrowTag from "@/components/ui/EyebrowTag";
import Button from "@/components/portfolio/ui/Button";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { faqs } from "@/lib/content/faqs";
import { toAbsoluteUrl } from "@/lib/site-url";

const pagePath = "/landing-pages-negocios-locales";

const pageTitle = "Landing Pages para Negocios Locales que Convierten | Xync";
const pageDescription =
  "Diseñamos landing pages para negocios locales orientadas a captar más contactos y ventas. Estrategia, copy, diseño y desarrollo en 14 días.";

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: toAbsoluteUrl(pagePath),
    type: "article",
    locale: "es_ES",
    siteName: "Xync",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

// FAQPage: Google retiró el rich result de FAQ en may-2026, así que esto ya no
// genera estrella/acordeón en el SERP. Se mantiene porque sigue ayudando a la
// CITACIÓN en buscadores de IA (AI Overviews, ChatGPT, Perplexity). No añadir
// más FAQPage esperando rich result; no usar HowTo (retirado sep-2023).
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: toAbsoluteUrl("/"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Landing pages para negocios locales",
      item: toAbsoluteUrl(pagePath),
    },
  ],
};

export default function LandingPagesNegociosLocalesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <PortfolioShell>
        <main className="relative z-10 bg-pf-bg px-4 pb-20 pt-36 md:px-6">
          <article className="mx-auto w-full max-w-4xl">
            <header className="text-center">
              <EyebrowTag className="border border-pf-line text-pf-muted">
                Guía SEO para servicios locales
              </EyebrowTag>
              <h1 className="mt-6 pf-display text-5xl leading-tight text-pf-ink-strong md:text-6xl">
                Landing pages para negocios locales que convierten visitas en clientes
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-pf-ink-soft md:text-lg">
                Esta guía explica cómo estructuramos una landing de conversión para captar más
                contactos cualificados sin ruido visual ni mensajes ambiguos.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button href="/#contacto" variant="primary" size="lg" withArrow>
                  Quiero una landing que convierta
                </Button>
                <Button href="/#proyectos" variant="outline" size="lg">
                  Ver proyectos
                </Button>
              </div>
            </header>

            <section className="mt-18 border-t border-pf-line pt-12">
              <h2 className="pf-display text-3xl text-pf-ink-strong md:text-4xl">
                Qué incluye una landing page completa
              </h2>
              <ul className="mt-6 list-disc space-y-2 pl-6 text-pf-ink-soft marker:text-pf-muted">
                <li>Estrategia de conversión y definición del objetivo principal.</li>
                <li>Copy orientado a ventas con estructura de alto impacto.</li>
                <li>Diseño visual con jerarquía clara para mejorar decisiones.</li>
                <li>Desarrollo responsive optimizado para SEO técnico.</li>
                <li>Integración de CTA y flujo de contacto sin fricción.</li>
              </ul>
            </section>

            <section className="mt-16 border-t border-pf-line pt-12">
              <h2 className="pf-display text-3xl text-pf-ink-strong md:text-4xl">
                Para quién está pensado
              </h2>
              <p className="mt-6 text-base leading-relaxed text-pf-ink-soft">
                Negocios locales de servicios que quieren aumentar citas, llamadas o formularios.
                Funciona especialmente bien para clínicas, estudios de belleza, hoteles boutique y
                marcas que invierten en tráfico de pago.
              </p>
            </section>

            <section className="mt-16 border-t border-pf-line pt-12">
              <h2 className="pf-display text-3xl text-pf-ink-strong md:text-4xl">
                Inversión orientativa
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <PriceCard
                  title="Landing Page Completa"
                  price="1.200€ - 2.400€"
                  description="Proyecto integral con estrategia, copy, diseño y desarrollo."
                />
                <PriceCard
                  title="Rediseño Express"
                  price="790€ - 1.200€"
                  description="Optimización de una landing existente con mejoras de conversión."
                />
                <PriceCard
                  title="Auditoría UX"
                  price="Desde 390€"
                  description="Análisis accionable para detectar bloqueos y priorizar cambios."
                />
              </div>
            </section>

            <section className="mt-16 border-t border-pf-line pt-12" id="faq-seo">
              <h2 className="pf-display text-3xl text-pf-ink-strong md:text-4xl">
                Preguntas frecuentes
              </h2>
              <div className="mt-6 space-y-4">
                {faqs.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-pf-line bg-pf-surface p-5">
                    <h3 className="text-base font-medium text-pf-ink">{item.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-pf-muted">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-16 border-t border-pf-line pt-12 text-center" id="cta-final">
              <h2 className="pf-display text-4xl text-pf-ink-strong">¿Listo para empezar?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-pf-ink-soft">
                Si quieres una landing enfocada en resultados, te proponemos una estructura clara y
                accionable en menos de 24h.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button href="/#contacto" variant="primary" size="lg" withArrow>
                  Hablar con Xync
                </Button>
                <Button href="/" variant="ghost" size="lg">
                  Volver a la home
                </Button>
              </div>
            </section>
          </article>
        </main>
      </PortfolioShell>
    </>
  );
}

function PriceCard({
  title,
  price,
  description,
}: {
  title: string;
  price: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-pf-line bg-pf-surface p-5">
      <h3 className="pf-display text-xl text-pf-ink">{title}</h3>
      <p className="mt-2 text-sm font-medium text-pf-ink">{price}</p>
      <p className="mt-3 text-sm leading-relaxed text-pf-muted">{description}</p>
    </article>
  );
}
