"use client";

import { motion } from "framer-motion";
import DoubleBezel from "@/components/ui/DoubleBezel";
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
    <section id="process" className="px-4 py-24 md:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex flex-col items-center text-center mb-16 gap-4"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.92, ease: [0.32, 0.72, 0, 1] }}
        >
          <EyebrowTag className="bg-white/10 text-muted">
            How Vexel Works
          </EyebrowTag>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-[-0.02em] text-foreground">
            Simple. Fast. No agency theatre.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-12"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeUpVariants}
              className={`md:col-span-4 ${
                index === 1 ? "md:mt-8" : ""
              } ${index === 2 ? "md:mt-16" : ""}`}
            >
              <DoubleBezel innerClassName="h-full p-7 md:p-8 flex flex-col gap-4">
                <div className="relative z-10 w-9 h-9 rounded-full bg-violet/20 ring-1 ring-violet/40 font-display font-bold text-sm text-violet-glow flex items-center justify-center shrink-0">
                  {step.number}
                </div>

                <h3 className="font-display font-bold text-xl text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </DoubleBezel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
