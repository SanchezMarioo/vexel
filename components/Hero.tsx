"use client";

import { motion } from "framer-motion";
import IslandButton from "@/components/ui/IslandButton";
import EyebrowTag from "@/components/ui/EyebrowTag";
import { staggerContainerVariants, fadeUpVariants } from "@/lib/motion";

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-background px-4 pt-24 pb-24">
      {/* Background orbs */}
      <div
        className="vx-orb-violet absolute top-[-20%] left-[10%] w-[60vw] h-[60vw] blur-[120px] opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="vx-orb-emerald absolute bottom-[-10%] right-[5%] w-[40vw] h-[40vw] blur-[100px] opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto gap-6"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpVariants}>
          <EyebrowTag className="bg-violet/20 text-violet-glow">
            Boutique Web Studio
          </EyebrowTag>
        </motion.div>

        <motion.h1
          variants={fadeUpVariants}
          className="font-display font-extrabold text-[clamp(2.75rem,8vw,6rem)] leading-[1.05] tracking-[-0.03em] text-foreground"
        >
          We Build Sites
          <br />
          <span className="text-violet-glow">That Convert.</span>
        </motion.h1>

        <motion.p
          variants={fadeUpVariants}
          className="text-[clamp(1rem,2.5vw,1.25rem)] text-muted max-w-xl leading-relaxed"
        >
          Landing pages, brand systems, and growth sprints — crafted in 14 days.
          For local businesses that deserve agency-tier work.
        </motion.p>

        <motion.div
          variants={fadeUpVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mt-2"
        >
          <IslandButton href="#contact" variant="primary">
            Get My Free Mockup
          </IslandButton>
          <a
            href="#services"
            className="text-sm text-muted hover:text-foreground transition-colors duration-300"
          >
            See our work ↓
          </a>
        </motion.div>

        <motion.p
          variants={fadeUpVariants}
          className="text-[11px] text-muted/60 mt-1"
        >
          No commitment. Delivered in 14 days or less.
        </motion.p>
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
