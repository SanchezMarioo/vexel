"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { identity } from "@/lib/portfolio/content";

/**
 * Carga diferida del formulario de contacto: react-hook-form + zod
 * solo se cargan cuando el visitante se aproxima a la sección #contacto
 * (rootMargin: 350px) o al interactuar. Así no penaliza el JS inicial de la home.
 */
export default function ContactFormLazy() {
  const [Form, setForm] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      import("./ContactForm")
        .then((mod) => {
          if (!cancelled) setForm(() => mod.default);
        })
        .catch(() => {
          // Fallback a contacto directo por email
        });
    };

    const host = document.getElementById("contacto");
    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver === "function" && host) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            load();
            observer?.disconnect();
          }
        },
        { rootMargin: "350px 0px" },
      );
      observer.observe(host);
    } else {
      load();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  if (Form) {
    const Loaded = Form;
    return <Loaded />;
  }

  return (
    <div className="min-h-[36rem] rounded-[var(--pf-radius-lg)] border border-pf-line bg-pf-surface/50 p-6 md:p-8">
      <noscript>
        <div className="text-sm leading-relaxed text-pf-ink-soft">
          El formulario necesita JavaScript. Escríbenos directamente a{" "}
          <a
            href={`mailto:${identity.email}`}
            className="text-pf-ink underline underline-offset-4"
          >
            {identity.email}
          </a>
          .
        </div>
      </noscript>
    </div>
  );
}
