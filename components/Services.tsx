"use client";

import DoubleBezel from "@/components/ui/DoubleBezel";
import EyebrowTag from "@/components/ui/EyebrowTag";

export default function Services() {
  return (
    <section id="services" className="vx-section px-4 md:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 text-center">
          <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
            Servicios y precios
          </EyebrowTag>
          <h2 className="mt-4 font-display text-5xl font-semibold text-white">
            Estructura clara. Resultado medible.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7">
            <DoubleBezel
              innerClassName="h-full p-8"
              className="h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(123,97,255,0.1)_0%,transparent_60%)]"
            >
              <ServiceCard
                eyebrow="Landing Page Completa"
                title="Mas clientes desde el dia uno"
                description="Construimos una pagina enfocada en una accion de alto valor para que tu trafico convierta en contactos reales."
                deliverables={[
                  "Estrategia de conversion",
                  "Copy + estructura completa",
                  "Diseno y desarrollo full",
                  "Analitica y soporte post-lanzamiento",
                ]}
                price="1.200"
                priceSuffix="a 2.400"
              />
            </DoubleBezel>
          </div>

          <div className="md:col-span-5">
            <DoubleBezel innerClassName="h-full p-8">
              <ServiceCard
                eyebrow="Rediseno Express"
                title="Mejor conversion en menos tiempo"
                description="Optimizamos tu landing actual para eliminar friccion y elevar la calidad del lead."
                deliverables={[
                  "Auditoria de estructura",
                  "Rediseno visual",
                  "Mejoras de CTA y copy",
                ]}
                price="790"
                priceSuffix="a 1.200"
              />
            </DoubleBezel>
          </div>

          <div className="md:col-span-5">
            <DoubleBezel innerClassName="h-full p-8">
              <ServiceCard
                eyebrow="Auditoria UX"
                title="Detecta que te frena hoy"
                description="Informe accionable para priorizar cambios que impactan conversion y confianza."
                deliverables={[
                  "Mapa de friccion",
                  "Checklist de mejoras",
                  "Roadmap de ejecucion",
                ]}
                price="390"
                priceSuffix="desde"
              />
            </DoubleBezel>
          </div>

          <div className="md:col-span-7">
            <DoubleBezel innerClassName="h-full p-8 flex flex-col justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Contacto directo
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">
                  Si prefieres hablarlo hoy, lo vemos juntos.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                  Te ayudamos a elegir el formato correcto segun tu momento de negocio.
                </p>
              </div>

              <a
                href="#contact"
                className="inline-flex w-fit items-center rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/70 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/40 hover:text-white"
                data-cursor-hover="true"
              >
                Empezar este proyecto -&gt;
              </a>
            </DoubleBezel>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  eyebrow,
  title,
  description,
  deliverables,
  price,
  priceSuffix,
}: {
  eyebrow: string;
  title: string;
  description: string;
  deliverables: string[];
  price: string;
  priceSuffix: string;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{eyebrow}</p>
      <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/60">{description}</p>

      <ul className="space-y-1.5 text-sm text-white/55">
        {deliverables.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>

      <div className="mt-auto border-t border-white/10 pt-5">
        <p className="font-display text-4xl font-semibold text-white">
          {price}€ <span className="text-white/30">{priceSuffix}</span>
        </p>
        <a
          href="#contact"
          className="mt-4 inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/70 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/40 hover:text-white"
          data-cursor-hover="true"
        >
          Empezar este proyecto -&gt;
        </a>
      </div>
    </div>
  );
}
