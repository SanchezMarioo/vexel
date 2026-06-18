import type { Transition, Variants } from "framer-motion";

/**
 * Portfolio motion vocabulary. Ease-out exponential curves, no bounce/elastic.
 * Reduced motion is handled globally via <MotionConfig reducedMotion="user">
 * in the portfolio root, plus the CSS @media (prefers-reduced-motion) reset.
 */

export const pfEaseOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const pfEaseInOut: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const pfDurations = {
  reveal: 0.8,
  slow: 1.1,
  fast: 0.4,
} as const;

const revealTransition: Transition = {
  duration: pfDurations.reveal,
  ease: pfEaseOut,
};

/** Default once-per-element viewport trigger. */
export const pfViewport = { once: true, amount: 0.3 } as const;

/** Vertical reveal for blocks of text and cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

/** Headline reveal: rises from a clipped baseline (mask, not opacity gate). */
export const clipUp: Variants = {
  hidden: { opacity: 0, y: "0.4em", clipPath: "inset(0 0 100% 0)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 -10% 0)",
    transition: { duration: pfDurations.slow, ease: pfEaseOut },
  },
};

/**
 * Entrada LCP-safe para el contenido above-the-fold del hero. NO usa `opacity`
 * ni `clip-path`: el elemento pinta a opacidad plena en el primer frame, así el
 * LCP no queda gateado por la hidratación de JS. Solo un leve desplazamiento.
 * Úsalo en el <h1> y la imagen del hero (el resto de secciones, que entran con
 * `whileInView` bajo el pliegue, sí pueden usar fadeUp/clipUp con opacidad).
 */
export const heroLcpSafe: Variants = {
  hidden: { y: 16 },
  visible: { y: 0, transition: { duration: pfDurations.reveal, ease: pfEaseOut } },
};

/** Stagger parent — children animate in sequence. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Tag / chip entrance — slight scale, snappy. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: pfDurations.fast, ease: pfEaseOut },
  },
};

/** Image mask reveal for project shots. */
export const maskReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: pfDurations.slow, ease: pfEaseOut },
  },
};
