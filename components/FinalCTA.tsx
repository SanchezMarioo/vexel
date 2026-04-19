"use client";

import { motion } from "framer-motion";
import IslandButton from "@/components/ui/IslandButton";
import EyebrowTag from "@/components/ui/EyebrowTag";

export default function FinalCTA() {
  return (
    <section id="contact" className="vx-section relative flex min-h-[80vh] items-center justify-center px-4 md:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,97,255,0.25)_0%,transparent_68%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <EyebrowTag className="border border-white/10 bg-white/5 text-white/70">
            Listo para empezar?
          </EyebrowTag>
        </motion.div>

        <h2 className="mt-6 font-display text-6xl font-semibold leading-tight text-white">
          <motion.span
            className="block"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          >
            Cuentanos tu proyecto.
          </motion.span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="mt-6 max-w-xl text-base text-white/50"
        >
          Respondemos en menos de 24h. Sin formularios interminables.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <IslandButton href="https://calendly.com" variant="primary" size="lg">
            Escribenos
          </IslandButton>
          <IslandButton href="#projects" variant="ghost">
            Ver mas proyectos
          </IslandButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="mt-12 text-xs text-white/40"
        >
          © 2025 Vexel · Instagram · LinkedIn
        </motion.p>
      </div>
    </section>
  );
}
