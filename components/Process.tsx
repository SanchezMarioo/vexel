"use client";

import { motion } from "framer-motion";
import EyebrowTag from "@/components/ui/EyebrowTag";
import { staggerContainerVariants, fadeUpVariants } from "@/lib/motion";

const steps = [
  {
    number: "01",
    title:  "Brief",
    description:
      "30-min discovery call. We map your goals, audience, and the single conversion target your page will be built around.",
  },
  {
    number: "02",
    title:  "Build",
    description:
      "14-day sprint with daily async updates. You approve milestones in Figma before anything goes to code. Zero surprises.",
  },
  {
    number: "03",
    title:  "Launch",
    description:
      "Live and indexed on day 14. You receive Figma source files, CMS access, and a 30-day support window.",
  },
];

export default function Process() {
  return (
    <section id="process" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-16 gap-4"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        >
          <EyebrowTag className="bg-white/10 text-muted">
            How Vexel Works
          </EyebrowTag>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-[-0.02em] text-foreground">
            Simple. Fast. No agency theatre.
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Connecting line (desktop only) */}
          <div
            className="hidden md:block absolute top-4 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-white/10"
            aria-hidden="true"
          />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={fadeUpVariants}
              className="flex flex-col items-center md:items-start text-center md:text-left md:px-8 md:first:pl-0 md:last:pr-0 gap-4"
            >
              {/* Step badge */}
              <div className="relative z-10 w-9 h-9 rounded-full bg-violet/20 ring-1 ring-violet/40 font-display font-bold text-sm text-violet-glow flex items-center justify-center flex-shrink-0">
                {step.number}
              </div>

              <h3 className="font-display font-bold text-xl text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
