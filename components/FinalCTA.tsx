"use client";

import { motion } from "framer-motion";
import IslandButton from "@/components/ui/IslandButton";
import EyebrowTag from "@/components/ui/EyebrowTag";
import { staggerContainerVariants, fadeUpVariants } from "@/lib/motion";

export default function FinalCTA() {
  return (
    <section id="contact" className="py-24 px-4 bg-cream">
      <motion.div
        className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6"
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={fadeUpVariants}>
          <EyebrowTag className="bg-black/10 text-black/50">
            Limited Availability
          </EyebrowTag>
        </motion.div>

        <motion.h2
          variants={fadeUpVariants}
          className="font-display font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-[-0.02em] text-[#0a0a0a]"
        >
          Ready to Build Something
          <br />
          That Actually Converts?
        </motion.h2>

        <motion.p
          variants={fadeUpVariants}
          className="text-sm font-semibold text-red-700/70 uppercase tracking-[0.15em]"
        >
          2 project slots open this month
        </motion.p>

        <motion.div variants={fadeUpVariants}>
          <IslandButton href="mailto:hello@vexel.studio" variant="dark">
            Get My Free Mockup
          </IslandButton>
        </motion.div>

        <motion.p
          variants={fadeUpVariants}
          className="text-xs text-black/40"
        >
          No deposit required · First mockup free · Delivered in 14 days
        </motion.p>
      </motion.div>
    </section>
  );
}
