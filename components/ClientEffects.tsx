"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function ClientEffects() {
  useEffect(() => {
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

      const nextTarget = document.querySelector<HTMLElement>(href);
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
