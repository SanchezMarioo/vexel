"use client";

import { m, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";

type FaqItem = { question: string; answer: string };

const transition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };

function ServiceFaqItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const id = useId();
  const panelId = `service-faq-panel-${id}`;
  const buttonId = `service-faq-button-${id}`;
  const itemTransition = reducedMotion ? { duration: 0 } : transition;

  return (
    <div className="py-5">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="-mx-3 flex w-[calc(100%+1.5rem)] items-center justify-between gap-6 px-3 py-1 text-left transition-colors duration-200 ease-[var(--pf-ease-out)] hover:bg-pf-surface motion-reduce:transition-none"
        >
          <span className="text-lg font-medium text-pf-ink-strong">{item.question}</span>
          <m.span
            aria-hidden="true"
            animate={{ rotate: open ? 45 : 0 }}
            transition={itemTransition}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-pf-ink-strong"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </m.span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows,opacity] duration-250 ease-[var(--pf-ease-out)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pf-prose pt-4 text-pf-ink-soft">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function ServiceFaq({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-8 divide-y divide-pf-line-strong">
      {items.map((item) => <ServiceFaqItem key={item.question} item={item} />)}
    </div>
  );
}
