"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { captureEntryPoint } from "@/lib/funnel/attribution";

export default function ClientEffects() {
  useEffect(() => {
    // Atribución del funnel: fija la primera página vista de la sesión (con
    // sus UTMs) antes de que el usuario navegue a /empezar.
    captureEntryPoint();

    const lenis = new Lenis({
      lerp: 0.07,
      wheelMultiplier: 0.92,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
    });

    const onAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href^='#']") as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      let nextTarget: HTMLElement | null = null;
      try {
        nextTarget = document.querySelector<HTMLElement>(href);
      } catch {
        return;
      }
      if (!nextTarget) {
        return;
      }

      event.preventDefault();
      lenis.scrollTo(nextTarget, { offset: -96, duration: 1.3 });
    };

    document.addEventListener("click", onAnchorClick);

    // Bucle de animación nativo para Lenis (sin GSAP).
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
