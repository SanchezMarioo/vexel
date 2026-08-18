"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, m } from "framer-motion";
import { identity, navLinks } from "@/lib/portfolio/content";
import { pfEaseOut } from "@/lib/portfolio/motion";
import Button from "./ui/Button";

const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

// useSyncExternalStore evita el render extra de inicializar "scrolled" desde
// un useEffect y aporta un snapshot de servidor (false) que hidrata limpio.
function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export default function Nav() {
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 12,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[var(--pf-ease)] ${
        scrolled
          ? "border-b border-pf-line bg-pf-bg/85 backdrop-blur-md shadow-[0_4px_20px_-10px_oklch(0_0_0/0.05)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Principal"
        className="pf-container flex h-16 items-center justify-between gap-6"
      >
        <a
          href="#inicio"
          className="group pf-display text-lg leading-none text-pf-ink transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          {identity.name}
          <span className="text-pf-ink transition-colors group-hover:text-emerald-500">.</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = active === id;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative rounded-[var(--pf-radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? "text-pf-ink" : "text-pf-ink-soft hover:text-pf-ink"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 -bottom-px h-[2px] origin-left bg-pf-ink transition-transform duration-300 ease-[var(--pf-ease-out)] ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <Button
            href="/empezar"
            size="sm"
            variant="ink"
            withArrow
            aria-label="Empezar un proyecto con Xync"
          >
            Empezar proyecto
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--pf-radius-sm)] text-pf-ink transition-colors hover:bg-pf-surface md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 block h-[2px] w-5 bg-current transition-[top,transform] duration-300 ease-[var(--pf-ease)] ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 block h-[2px] w-5 bg-current transition-[bottom,transform] duration-300 ease-[var(--pf-ease)] ${
                open ? "bottom-1.5 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: pfEaseOut }}
            className="overflow-hidden border-t border-pf-line bg-pf-bg/95 backdrop-blur-md md:hidden"
          >
            <ul className="pf-container flex flex-col py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-pf-line py-3.5 text-base font-medium text-pf-ink-soft transition-colors hover:text-pf-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-5 pb-2">
                <Button
                  href="/empezar"
                  variant="primary"
                  className="w-full"
                  withArrow
                  aria-label="Empezar un proyecto con Xync"
                >
                  Empezar proyecto
                </Button>
              </li>
            </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
