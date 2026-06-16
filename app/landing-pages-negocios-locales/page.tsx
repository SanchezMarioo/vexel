import type { Metadata } from "next";
import EyebrowTag from "@/components/ui/EyebrowTag";
import IslandButton from "@/components/ui/IslandButton";
import { faqs } from "@/lib/content/faqs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vexel.vercel.app";
const pagePath = "/landing-pages-negocios-locales";

const pageTitle = "Landing Pages para Negocios Locales que Convierten | Vexel";
const pageDescription =
  "Disenamos landing pages para negocios locales orientadas a captar mas contactos y ventas. Estrategia, copy, diseno y desarrollo en 14 dias.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${siteUrl}${pagePath}`,
    type: "article",
    locale: "es_ES",
    siteName: "Vexel",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

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
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Landing pages para negocios locales",
      item: `${siteUrl}${pagePath}`,
    },
  ],
};

export default function LandingPagesNegociosLocalesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="relative z-10 bg-background px-4 pb-20 pt-36 md:px-6">
        <article className="mx-auto w-full max-w-4xl">
          <header className="text-center">
            <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
              Guia SEO para servicios locales
            </EyebrowTag>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-tight text-white md:text-6xl">
              Landing pages para negocios locales que convierten visitas en clientes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              Esta guia explica como estructuramos una landing de conversion para captar mas
              contactos cualificados sin ruido visual ni mensajes ambiguos.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <IslandButton href="/#contact" variant="primary">
                Quiero una landing que convierta
              </IslandButton>
              <IslandButton href="/#projects" variant="ghost">
                Ver proyectos
              </IslandButton>
            </div>
          </header>

          <section className="mt-18 border-t border-white/10 pt-12">
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
              Que incluye una landing page completa
            </h2>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-white/65 marker:text-white/40">
              <li>Estrategia de conversion y definicion de objetivo principal.</li>
              <li>Copy orientado a ventas con estructura de alto impacto.</li>
              <li>Diseno visual con jerarquia clara para mejorar decisiones.</li>
              <li>Desarrollo responsive optimizado para SEO tecnico.</li>
              <li>Integracion de CTA y flujo de contacto sin friccion.</li>
            </ul>
          </section>

          <section className="mt-16 border-t border-white/10 pt-12">
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
              Para quien esta pensado
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/65">
              Negocios locales de servicios que quieren aumentar citas, llamadas o formularios.
              Funciona especialmente bien para clinicas, estudios de belleza, hoteles boutique y
              marcas que invierten en trafico de pago.
            </p>
          </section>

          <section className="mt-16 border-t border-white/10 pt-12">
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
              Inversion orientativa
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <PriceCard
                title="Landing Page Completa"
                price="1.200€ - 2.400€"
                description="Proyecto integral con estrategia, copy, diseno y desarrollo."
              />
              <PriceCard
                title="Rediseno Express"
                price="790€ - 1.200€"
                description="Optimizacion de una landing existente con mejoras de conversion."
              />
              <PriceCard
                title="Auditoria UX"
                price="Desde 390€"
                description="Analisis accionable para detectar bloqueos y priorizar cambios."
              />
            </div>
          </section>

          <section className="mt-16 border-t border-white/10 pt-12" id="faq-seo">
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
              Preguntas frecuentes
            </h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-2xl border border-white/10 bg-white/3 p-5">
                  <h3 className="text-base font-medium text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 border-t border-white/10 pt-12 text-center" id="cta-final">
            <h2 className="font-display text-4xl font-semibold text-white">Listo para empezar?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/65">
              Si quieres una landing enfocada en resultados, te proponemos una estructura clara y
              accionable en menos de 24h.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <IslandButton href="/#contact" variant="primary">
                Hablar con Vexel
              </IslandButton>
              <IslandButton href="/" variant="ghost">
                Volver a la home
              </IslandButton>
            </div>
          </section>
        </article>
      </main>
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
    <article className="rounded-2xl border border-white/12 bg-white/3 p-5">
      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#A594FF]">{price}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{description}</p>
    </article>
  );
}
