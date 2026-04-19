"use client";

import { useEffect, useRef, useState } from "react";
import DoubleBezel from "@/components/ui/DoubleBezel";
import EyebrowTag from "@/components/ui/EyebrowTag";

const testimonials = [
  {
    quote:
      "Vexel nos ayudo a pasar de una web bonita a una web que realmente mueve contactos cada semana.",
    name: "Carlos M.",
    role: "Fundador, Brava Dental",
    initials: "CM",
  },
  {
    quote:
      "La claridad del mensaje y la velocidad de ejecucion nos dio una ventaja inmediata frente a competidores directos.",
    name: "Lucia R.",
    role: "Directora, Luna Studio",
    initials: "LR",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="testimonials" ref={sectionRef} className="vx-section px-4 md:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 text-center">
          <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
            Testimonios
          </EyebrowTag>
          <h2 className="mt-4 font-display text-5xl font-semibold text-white">
            Clientes que ya estan creciendo.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {testimonials.map((item, index) => (
            <div
              key={item.name}
              className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : index === 0
                    ? "-translate-x-10 opacity-0"
                    : "translate-x-10 opacity-0"
              }`}
            >
              <DoubleBezel innerClassName="h-full p-8">
                <div className="flex h-full flex-col">
                  <p className="font-display text-6xl leading-none text-[#7B61FF]">&quot;</p>

                  <p className="mt-4 text-base leading-relaxed text-white/70">{item.quote}</p>

                  <span className="my-6 block h-px w-8 bg-white/20" />

                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7B61FF]/20 text-sm text-[#7B61FF]">
                      {item.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-white/40">{item.role}</p>
                    </div>
                  </div>
                </div>
              </DoubleBezel>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
