"use client";

import { motion } from "framer-motion";
import IslandButton from "@/components/ui/IslandButton";
import EyebrowTag from "@/components/ui/EyebrowTag";

export default function Hero() {
  return (
    <section className="vx-section relative flex min-h-dvh items-center justify-center overflow-hidden px-4 pt-36 md:px-6">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[50vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(123,97,255,0.15)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0, ease: [0.32, 0.72, 0, 1] }}
        >
          <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
            Diseno web de conversion
          </EyebrowTag>
        </motion.div>

        <h1 className="mt-6 text-7xl font-semibold leading-[0.95] tracking-tight text-white md:text-8xl">
          <motion.span
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="block"
          >
            Tu negocio merece
          </motion.span>
          <motion.span
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="block"
          >
            una web que <span className="text-[#7B61FF]">venda</span>.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="mt-8 max-w-xl text-lg text-white/50"
        >
          Vexel construye landing pages ultramodernas para negocios locales y
          creativos que quieren crecer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <div className="rounded-full border border-white/15 bg-white/3 p-0.75">
            <IslandButton href="#projects" variant="primary" className="border-[#9f8dff]">
              Ver proyectos
            </IslandButton>
          </div>

          <IslandButton href="#about" variant="ghost">
            Conoce Vexel
          </IslandButton>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center"
        aria-hidden="true"
      >
        <span className="relative h-14 w-px overflow-hidden bg-white/20">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-white"
            animate={{ y: [0, 36, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}
