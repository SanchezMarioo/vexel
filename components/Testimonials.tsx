"use client";

import { motion } from "framer-motion";
import DoubleBezel from "@/components/ui/DoubleBezel";
import EyebrowTag from "@/components/ui/EyebrowTag";
import { staggerContainerVariants, fadeUpVariants } from "@/lib/motion";

const testimonials = [
  {
    result:  "↑ 4.1× leads in 60 days",
    quote:   "Vexel turned our dusty landing page into a lead machine. Booked three discovery calls in the first week. The attention to detail is unreal.",
    name:    "Marcus T.",
    title:   "Founder @ Zelos.io",
    initial: "M",
  },
  {
    result:  "Brand system in 4 days",
    quote:   "Fastest, most professional team I've worked with. The brand system was delivered in 4 days and is ready for every medium from print to app.",
    name:    "Priya S.",
    title:   "CMO @ Nomad Health",
    initial: "P",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-12 gap-4"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        >
          <EyebrowTag className="bg-emerald/20 text-emerald-glow">
            Real Results
          </EyebrowTag>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-[-0.02em] text-foreground">
            40+ businesses already growing.
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeUpVariants}>
              <DoubleBezel innerClassName="p-8 flex flex-col gap-5 h-full">
                <EyebrowTag className="bg-emerald/20 text-emerald-glow self-start">
                  {t.result}
                </EyebrowTag>

                <blockquote className="font-display text-lg font-medium leading-snug text-foreground flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-violet/30 flex items-center justify-center font-display font-bold text-sm text-violet-glow flex-shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted">{t.title}</p>
                  </div>
                </div>
              </DoubleBezel>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
