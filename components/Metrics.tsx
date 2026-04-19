"use client";

import { motion } from "framer-motion";
import { staggerContainerVariants, metricsVariants } from "@/lib/motion";

const metrics = [
  { number: "40+",   label: "Clients Served" },
  { number: "14-Day", label: "Guaranteed Delivery" },
  { number: "3.2×",  label: "Average Lead Growth" },
];

export default function Metrics() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10"
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            variants={metricsVariants}
            className="flex flex-col items-center text-center py-8 sm:py-0 sm:px-12 first:pt-0 last:pb-0 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="font-display font-black text-[clamp(3rem,7vw,5rem)] leading-none text-foreground">
              {m.number}
            </span>
            <span className="text-[13px] text-muted uppercase tracking-[0.15em] mt-3">
              {m.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
