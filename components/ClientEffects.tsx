"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function ClientEffects() {
  useEffect(() => {
    let isDisposed = false;

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

    const onLenisScroll = () => {
      const w = window as Window & {
        ScrollTrigger?: { update: () => void };
      };

      if (w.ScrollTrigger) {
        w.ScrollTrigger.update();
      }
    };

    lenis.on("scroll", onLenisScroll);
    document.addEventListener("click", onAnchorClick);

    let removeTicker = () => {};

    const initTickerSync = async () => {
      const gsapModule = await import("gsap");

      if (isDisposed) {
        return;
      }

      const gsap = gsapModule.gsap;
      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      removeTicker = () => {
        gsap.ticker.remove(tick);
      };
    };

    initTickerSync();

    return () => {
      isDisposed = true;
      removeTicker();
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
