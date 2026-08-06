"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { faqs } from "@/lib/portfolio/content";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reducedMotion = useReducedMotion();
  const panelTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };

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
          <ul className="border-t border-pf-line-strong">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              return (
                <li key={faq.question} className="border-b border-pf-line-strong">
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="-mx-3 flex w-[calc(100%+1.5rem)] items-center justify-between gap-6 px-3 py-5 text-left transition-colors duration-200 ease-[var(--pf-ease-out)] hover:bg-pf-surface motion-reduce:transition-none"
                    >
                      <span
                        className={`text-lg text-pf-ink ${
                          isOpen ? "font-medium" : ""
                        }`}
                      >
                        {faq.question}
                      </span>
                      <m.span
                        aria-hidden="true"
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={panelTransition}
                        className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-pf-ink-strong"
                      >
                        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                      </m.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false} mode="wait">
                    {isOpen ? (
                      <m.div
                        key={panelId}
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: reducedMotion ? "auto" : 0, opacity: 0 }}
                        transition={panelTransition}
                        className="overflow-hidden"
                      >
                        <p className="pf-prose pb-6 pr-10 text-pf-ink-soft">{faq.answer}</p>
                      </m.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
