"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import DoubleBezel from "@/components/ui/DoubleBezel";
import EyebrowTag from "@/components/ui/EyebrowTag";
import IslandButton from "@/components/ui/IslandButton";

const shots = [
  {
    id: "a",
    src: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80",
    alt: "Diseno de dashboard para negocio local",
    rotation: "md:rotate-2",
    delay: 0,
  },
  {
    id: "b",
    src: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80",
    alt: "Landing page optimizada para conversion",
    rotation: "md:-rotate-1",
    delay: 0.15,
  },
  {
    id: "c",
    src: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
    alt: "Proyecto visual de marca digital",
    rotation: "md:rotate-1",
    delay: 0.3,
  },
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="vx-section px-4 md:px-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
            Sobre Vexel
          </EyebrowTag>

          <h2 id="about-title" className="mt-4 font-display text-5xl font-semibold leading-tight text-white">
            Precision vectorial.
            <br />
            Obsesion por el pixel.
          </h2>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/50">
            Vexel nace de la fusion entre vector y pixel para construir landing pages
            donde cada bloque tiene un objetivo de conversion claro.
          </p>

          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-white/70 marker:text-white/45">
            <li>Claridad narrativa</li>
            <li>Diseno con intencion comercial</li>
            <li>Ejecucion tecnica sin ruido</li>
          </ul>

          <div className="mt-8">
            <IslandButton href="#services" variant="ghost">
              Conoce el proceso
            </IslandButton>
          </div>
        </div>

        <div className="relative flex flex-col gap-4">
          {shots.map((shot) => (
            <motion.div
              key={shot.id}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: shot.delay, ease: [0.32, 0.72, 0, 1] }}
              className={`rotate-0 ${shot.rotation}`}
            >
              <DoubleBezel innerClassName="overflow-hidden">
                <div className="relative h-44 w-full md:h-48">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </DoubleBezel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
