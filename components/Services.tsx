"use client";

import { motion } from "framer-motion";
import DoubleBezel from "@/components/ui/DoubleBezel";
import EyebrowTag from "@/components/ui/EyebrowTag";
import { staggerContainerVariants, fadeUpVariants } from "@/lib/motion";

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.81l-3.5-1.6" />
      <path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.81l-3.5-1.6" />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

const services = [
  {
    id:          "landing",
    eyebrow:     "Landing Pages",
    eyebrowClass:"bg-violet/20 text-violet-glow",
    icon:        <PenIcon />,
    iconClass:   "text-violet-glow",
    title:       "Conversion-Engineered Pages",
    description: "Built in 14 days, every pixel earns its keep. We map the entire conversion funnel before writing a single line of code.",
    metric:      "↑ 3.2× lead growth, avg.",
    metricClass: "text-violet-glow",
    tall:        true,
  },
  {
    id:          "brand",
    eyebrow:     "Brand Systems",
    eyebrowClass:"bg-emerald/20 text-emerald-glow",
    icon:        <LayersIcon />,
    iconClass:   "text-emerald-glow",
    title:       "Visual Identity That Signals Premium",
    description: "From logo mark to full design system. Delivered as Figma tokens and production-ready CSS.",
    metric:      "Delivered in 5 business days",
    metricClass: "text-emerald-glow",
    tall:        false,
  },
  {
    id:          "growth",
    eyebrow:     "Growth Sprints",
    eyebrowClass:"bg-amber-500/20 text-amber-400",
    icon:        <LightningIcon />,
    iconClass:   "text-amber-400",
    title:       "Results in Weeks, Not Quarters",
    description: "A/B tests, copy rewrites, and CRO audits packaged as rapid sprints. You keep the learnings forever.",
    metric:      "Avg. +40% conversion lift",
    metricClass: "text-amber-400",
    tall:        false,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-4 relative">
      {/* Subtle mid-section violet orb */}
      <div
        className="vx-orb-violet absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[50vw] blur-[160px] opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="flex flex-col items-center text-center mb-12 gap-4"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        >
          <EyebrowTag className="bg-white/10 text-muted">
            What We Build
          </EyebrowTag>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-[-0.02em] text-foreground">
            Three offerings.
            <br />
            <span className="text-muted">One obsession: your growth.</span>
          </h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {services.map((s) => (
            <motion.div
              key={s.id}
              variants={fadeUpVariants}
              className={s.tall ? "md:row-span-2" : ""}
            >
              <DoubleBezel innerClassName="p-8 flex flex-col gap-4 h-full">
                <EyebrowTag className={s.eyebrowClass}>{s.eyebrow}</EyebrowTag>
                <div className={s.iconClass}>{s.icon}</div>
                <h3 className="font-display font-bold text-xl text-foreground leading-snug">
                  {s.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed flex-1">
                  {s.description}
                </p>
                <p className={`text-[13px] font-semibold ${s.metricClass}`}>
                  {s.metric}
                </p>
              </DoubleBezel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
