"use client";

import { useEffect, useState } from "react";
import { identity, navLinks } from "@/lib/portfolio/content";
import Button from "./ui/Button";

const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

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
      className={`sticky top-0 z-40 transition-colors duration-300 ease-[var(--pf-ease)] ${
        scrolled
          ? "border-b border-pf-line bg-pf-bg/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Principal"
        className="pf-container flex h-16 items-center justify-between gap-6"
      >
        <a href="#inicio" className="pf-display text-lg leading-none text-pf-ink">
          {identity.name}
          <span className="text-pf-ink">.</span>
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
                  className={`relative rounded-[var(--pf-radius-sm)] px-3 py-2 text-sm transition-colors duration-200 ${
                    isActive ? "text-pf-ink" : "text-pf-ink-soft hover:text-pf-ink"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 -bottom-px h-px origin-left bg-pf-ink transition-transform duration-300 ease-[var(--pf-ease-out)] ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <Button href="#contacto" size="sm" variant="ink">
            Hablemos
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--pf-radius-sm)] text-pf-ink md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 block h-[2px] w-5 bg-current transition-all duration-300 ease-[var(--pf-ease)] ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 block h-[2px] w-5 bg-current transition-all duration-300 ease-[var(--pf-ease)] ${
                open ? "bottom-1.5 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-pf-line bg-pf-bg md:hidden"
        >
          <ul className="pf-container flex flex-col py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-pf-line py-3 text-base text-pf-ink-soft hover:text-pf-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <Button href="#contacto" variant="primary" className="w-full" withArrow>
                Hablemos
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
