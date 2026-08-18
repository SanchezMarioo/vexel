"use client";

import { useEffect } from "react";
import { captureEntryPoint } from "@/lib/funnel/attribution";

export default function ClientEffects() {
  useEffect(() => {
    // Atribución del funnel: fija la primera página vista de la sesión (con
    // sus UTMs) antes de que el usuario navegue a /empezar.
    captureEntryPoint();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    let lenisInstance: import("lenis").default | null = null;
    let rafId = 0;
    let destroyed = false;

    const initLenis = async () => {
      const { default: Lenis } = await import("lenis");
      if (destroyed) return;

      const lenis = new Lenis({
        lerp: 0.07,
        wheelMultiplier: 0.92,
        smoothWheel: true,
        syncTouch: false,
        allowNestedScroll: true,
      });
      lenisInstance = lenis;

      const raf = (time: number) => {
        if (destroyed) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    // Inicialización no bloqueante tras el primer paint
    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
        () => {
          void initLenis();
        },
      );
    } else {
      setTimeout(() => {
        void initLenis();
      }, 50);
    }

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

      if (lenisInstance) {
        event.preventDefault();
        lenisInstance.scrollTo(nextTarget, { offset: -96, duration: 1.3 });
      }
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      destroyed = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener("click", onAnchorClick);
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, []);

  return null;
}
