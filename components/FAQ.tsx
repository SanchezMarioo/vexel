"use client";

import { useState } from "react";
import EyebrowTag from "@/components/ui/EyebrowTag";
import { faqs } from "@/lib/content/faqs";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="vx-section px-4 md:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
            Preguntas frecuentes
          </EyebrowTag>
          <h2 className="mt-4 font-display text-4xl font-semibold text-white">
            Todo lo que necesitas saber antes de empezar
          </h2>
        </div>

        <div>
          {faqs.map((item, index) => {
            const isOpen = activeIndex === index;
            const buttonId = `faq-button-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div key={item.question} className="border-b border-white/5 py-4">
                <button
                  type="button"
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-6 text-left"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  data-cursor-hover="true"
                >
                  <span
                    className={`text-base font-medium transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isOpen ? "text-[#7B61FF]" : "text-white"
                    }`}
                  >
                    {item.question}
                  </span>

                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20">
                    <span
                      className={`h-px w-3 bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isOpen ? "rotate-90" : "rotate-0"
                      }`}
                    />
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={`overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isOpen ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="pt-3 text-sm leading-relaxed text-white/50">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
