"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { identity } from "@/lib/portfolio/content";

type IdleHandle = number;

function scheduleIdle(load: () => void): IdleHandle {
  if (typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(load, { timeout: 2500 });
  }
  return window.setTimeout(load, 1500);
}

function cancelIdle(handle: IdleHandle) {
  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(handle);
  } else {
    window.clearTimeout(handle);
  }
}

/**
 * Carga diferida del formulario de contacto: react-hook-form + zod (~340 KB
 * sin comprimir) no pertenecen a la ruta crítica de la home. Se importa en el
 * primer idle (con tope de 2.5 s) o cuando el formulario se acerca al
 * viewport, lo que ocurra antes. El marcador reserva la tarjeta para que no
 * haya saltos de layout.
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
          // Sin el chunk no hay formulario; el email directo de la columna
          // izquierda sigue siendo una vía de contacto válida.
        });
    };

    const idleHandle: IdleHandle = scheduleIdle(load);

    // Si el usuario se acerca antes del idle, adelantamos la carga.
    const host = document.getElementById("contacto");
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function" && host) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            cancelIdle(idleHandle);
            load();
            observer?.disconnect();
          }
        },
        { rootMargin: "0px 0px 40% 0px" },
      );
      observer.observe(host);
    }

    return () => {
      cancelled = true;
      cancelIdle(idleHandle);
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
