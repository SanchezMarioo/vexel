import type { Transition, Variants } from "framer-motion";

/**
 * Portfolio motion vocabulary. Ease-out exponential curves, no bounce/elastic.
 * Reduced motion is handled globally via <MotionConfig reducedMotion="user">
 * in the portfolio root, plus the CSS @media (prefers-reduced-motion) reset.
 */

export const pfEaseOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const pfDurations = {
  reveal: 0.8,
  slow: 1.1,
  fast: 0.4,
} as const;

const revealTransition: Transition = {
  duration: pfDurations.reveal,
  ease: pfEaseOut,
};

/**
 * Default once-per-element viewport trigger. Usa margen del viewport en vez de
 * `amount`: un porcentaje del elemento (p. ej. 0.3) nunca se alcanza en móvil
 * cuando el contenedor apilado mide varias pantallas de alto, y la sección se
 * queda invisible. Con `margin` dispara en cuanto el borde superior entra en el
 * 82% superior del viewport, sea cual sea la altura del elemento.
 */
export const pfViewport = { once: true, margin: "0px 0px -18% 0px" } as const;

/** Vertical reveal for blocks of text and cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

/**
 * Entrada LCP-safe para el contenido above-the-fold del hero. NO usa `opacity`,
 * `clip-path` ni `transform` inicial: el elemento pinta inmediatamente en el
 * primer frame, evitando retrasos artificiales de LCP por hidratación de JS.
 */
export const heroLcpSafe: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
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
