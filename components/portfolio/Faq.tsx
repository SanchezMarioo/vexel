"use client";

import { useState } from "react";
import { faqs } from "@/lib/portfolio/content";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-label="Preguntas frecuentes"
      className="scroll-mt-20 border-t border-pf-line py-24 md:py-32"
    >
      <div className="pf-container grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2
            className="pf-display text-pf-ink-strong"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}
          >
            Preguntas frecuentes
          </h2>
          <p className="pf-prose mt-5 text-pf-ink-soft">
            ¿No está aquí lo que buscas? Escríbeme y te respondo sin rodeos.
          </p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <ul className="border-t border-pf-line">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              return (
                <li key={index} className="border-b border-pf-line">
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left"
                    >
                      <span
                        className={`text-lg text-pf-ink ${
                          isOpen ? "font-medium" : ""
                        }`}
                      >
                        {faq.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`relative h-4 w-4 flex-shrink-0 text-pf-ink-soft transition-transform duration-300 ease-[var(--pf-ease)] ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
                        <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-current" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-[var(--pf-ease)] ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pf-prose pb-6 pr-10 text-pf-ink-soft">{faq.answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
