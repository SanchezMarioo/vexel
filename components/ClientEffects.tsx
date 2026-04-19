"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

const interactiveSelector =
  "a,button,[role='button'],input,textarea,select,[data-cursor-hover='true']";

export default function ClientEffects() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
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
      lenis.scrollTo(nextTarget, { offset: -96, duration: 1.1 });
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

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("click", onAnchorClick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const html = document.documentElement;
    const cursor = cursorRef.current;

    if (!cursor) {
      return;
    }

    html.classList.add("has-custom-cursor");

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    let currentScale = 1;
    let targetScale = 1;

    let frame = 0;

    const moveCursor = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      currentScale += (targetScale - currentScale) * 0.2;

      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${currentScale})`;
      frame = window.requestAnimationFrame(moveCursor);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      const target = event.target as HTMLElement | null;
      const inProjects = Boolean(target?.closest(".projects-section"));
      const onInteractive = Boolean(target?.closest(interactiveSelector));

      targetScale = inProjects || onInteractive ? 5.33 : 1;
      cursor.classList.toggle("is-project", inProjects);
    };

    const onPointerLeave = () => {
      targetScale = 0;
    };

    const onPointerEnter = () => {
      targetScale = 1;
    };

    frame = window.requestAnimationFrame(moveCursor);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerenter", onPointerEnter);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerenter", onPointerEnter);
      html.classList.remove("has-custom-cursor");
    };
  }, []);

  return <div ref={cursorRef} className="vx-cursor" aria-hidden="true" />;
}
