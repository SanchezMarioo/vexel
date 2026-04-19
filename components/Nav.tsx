"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IslandButton from "@/components/ui/IslandButton";

const navLinks = [
  { label: "Proyectos", href: "#projects" },
  { label: "Servicios", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contacto", href: "#contact" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsSolid(window.scrollY > 80);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-6 z-40 w-full -translate-x-1/2 px-4">
        <motion.nav
          className={`pointer-events-auto mx-auto flex w-[min(980px,calc(100vw-2rem))] items-center justify-between rounded-full border px-5 py-3 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isSolid
              ? "border-white/18 bg-black/78 shadow-[0_12px_45px_rgba(0,0,0,0.45)]"
              : "border-white/12 bg-black/62"
          }`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        >
          <a
            href="#"
            className="shrink-0 font-display text-lg font-semibold tracking-tight text-white"
            data-cursor-hover="true"
          >
            Vexel
          </a>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-white/70 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white"
                  data-cursor-hover="true"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <IslandButton href="#contact" variant="primary">
              Hablemos
            </IslandButton>
          </div>

          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/55 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            data-cursor-hover="true"
          >
            <span className="flex flex-col items-center gap-1.25">
              <span
                className={`h-[1.5px] w-5 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  menuOpen ? "translate-y-[3.5px] rotate-45" : "translate-y-0 rotate-0"
                }`}
              />
              <span
                className={`h-[1.5px] w-5 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  menuOpen ? "-translate-y-[3.5px] -rotate-45" : "translate-y-0 rotate-0"
                }`}
              />
            </span>
          </button>
        </motion.nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black/80 backdrop-blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-4xl font-semibold text-white"
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 48 }}
                transition={{
                  duration: 0.55,
                  ease: [0.32, 0.72, 0, 1],
                  delay: 0.1 + index * 0.05,
                }}
                data-cursor-hover="true"
              >
                {link.label}
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 48 }}
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1], delay: 0.34 }}
            >
              <IslandButton href="#contact" variant="primary" onClick={() => setMenuOpen(false)}>
                Hablemos
              </IslandButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
