"use client";

import { motion } from "framer-motion";
import { testimonials } from "@/lib/portfolio/content";
import { fadeUp, pfViewport, stagger } from "@/lib/portfolio/motion";

export default function Testimonials() {
  return (
    <section
      aria-label="Testimonios"
      className="scroll-mt-20 border-t border-pf-line bg-pf-bg py-24 md:py-32"
    >
      <div className="pf-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={pfViewport}
          variants={stagger(0.18)}
          className="grid gap-x-8 gap-y-14 md:grid-cols-2"
        >
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={index}
              variants={fadeUp}
              className={index % 2 === 1 ? "md:mt-20" : ""}
            >
              <span
                aria-hidden="true"
                className="pf-display block text-8xl leading-none text-pf-ink-strong opacity-[0.08]"
              >
                &ldquo;
              </span>
              <blockquote
                className="pf-display mt-4 text-pf-ink"
                style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em" }}
              >
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-8 bg-pf-ink-strong" />
                <span>
                  <span className="font-bold text-pf-ink-strong">{testimonial.author}</span>
                  <span className="pf-mono ml-2 text-sm text-pf-muted">{testimonial.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
