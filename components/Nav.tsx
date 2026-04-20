"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IslandButton from "@/components/ui/IslandButton";

const navLinks = [
  { label: "Proyectos", href: "#projects" },
  { label: "Servicios", href: "#services" },
  { label: "Sobre", href: "#about" },
  { label: "Contacto", href: "#contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(false);

  const isAuthenticated = Boolean(session?.user?.id);
  const isHome = pathname === "/";

  useEffect(() => {
    let frame = 0;

    const updateSolidState = () => {
      frame = 0;
      const next = window.scrollY > 80;
      setIsSolid((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateSolidState);
    };

    updateSolidState();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
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

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-6 z-40 w-full -translate-x-1/2 px-4">
        <motion.nav
          aria-label="Navegacion principal"
          className={`pointer-events-auto mx-auto flex w-[min(980px,calc(100vw-2rem))] items-center justify-between rounded-full border px-5 py-3 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isSolid
              ? "border-white/18 bg-black/78 shadow-[0_12px_45px_rgba(0,0,0,0.45)]"
              : "border-white/12 bg-black/62"
          }`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        >
          <Link
            href={isHome ? "#main-content" : "/"}
            className="shrink-0 font-display text-lg font-semibold tracking-tight text-white"
            data-cursor-hover="true"
            aria-label="Ir al contenido principal"
          >
            Vexel
          </Link>

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

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/cuenta"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
              >
                Mi cuenta
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/auth/login"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
              >
                Entrar
              </Link>
              <IslandButton href="/auth/register" variant="primary">
                Crear cuenta
              </IslandButton>
            </div>
          )}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/55 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
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
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegacion"
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

            {isAuthenticated ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 48 }}
                  transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1], delay: 0.34 }}
                >
                  <Link
                    href="/cuenta"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-white/20 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
                  >
                    Mi cuenta
                  </Link>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={handleLogout}
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 48 }}
                  transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1], delay: 0.38 }}
                  className="rounded-full border border-white/20 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
                >
                  Salir
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 48 }}
                  transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1], delay: 0.34 }}
                >
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-white/20 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/35 hover:bg-white/5"
                  >
                    Entrar
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 48 }}
                  transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1], delay: 0.38 }}
                >
                  <IslandButton href="/auth/register" variant="primary" onClick={() => setMenuOpen(false)}>
                    Crear cuenta
                  </IslandButton>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
