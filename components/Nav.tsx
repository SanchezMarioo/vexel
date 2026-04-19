"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionTemplate, useTransform } from "framer-motion";
import IslandButton from "@/components/ui/IslandButton";
import { navStaggerVariants, navItemVariants, mobileLinkVariants } from "@/lib/motion";

const navLinks = [
  { label: "Work",     href: "#services" },
  { label: "Process",  href: "#process" },
  { label: "Results",  href: "#testimonials" },
];

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 40], [0, 0.5]);
  const boxShadow = useMotionTemplate`0 8px 32px rgba(0,0,0,${shadowOpacity})`;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 px-4 pointer-events-none">
        <motion.nav
          style={{ boxShadow }}
          className="pointer-events-auto rounded-full bg-white/[0.06] backdrop-blur-2xl ring-1 ring-white/10 px-4 py-2.5 flex items-center gap-6 max-w-[calc(100vw-2rem)]"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.1 }}
        >
          {/* Logo */}
          <a href="#" className="font-display font-bold text-lg tracking-tight text-foreground flex-shrink-0">
            Vexel
          </a>

          {/* Desktop links */}
          <motion.ul
            className="hidden md:flex items-center gap-6"
            variants={navStaggerVariants}
            initial="hidden"
            animate="visible"
          >
            {navLinks.map((link) => (
              <motion.li key={link.href} variants={navItemVariants}>
                <a
                  href={link.href}
                  className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                >
                  {link.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>

          {/* Desktop CTA */}
          <div className="hidden md:block flex-shrink-0">
            <IslandButton href="#contact" variant="primary">
              Free Mockup
            </IslandButton>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto text-foreground p-1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <motion.div
              key={menuOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </motion.div>
          </button>
        </motion.nav>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 backdrop-blur-3xl bg-black/80 flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.ul
              className="flex flex-col items-center gap-8"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.li key={link.href} variants={mobileLinkVariants}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display font-bold text-4xl text-foreground hover:text-violet-glow transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li variants={mobileLinkVariants}>
                <IslandButton href="#contact" variant="primary" onClick={() => setMenuOpen(false)}>
                  Free Mockup
                </IslandButton>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
