import type { Variants } from "framer-motion";

export const vexelEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const vexelDurations = {
  reveal: 0.92,
  hover: 0.7,
  fast: 0.45,
};

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 64,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: vexelDurations.reveal,
      ease: vexelEase,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const metricsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: vexelDurations.reveal,
      ease: vexelEase,
    },
  },
};

export const navItemVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: vexelDurations.fast,
      ease: vexelEase,
    },
  },
};

export const navStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const mobileMenuVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: vexelDurations.fast,
      ease: vexelEase,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: vexelDurations.fast,
      ease: vexelEase,
    },
  },
};

export const mobileLinkVariants: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: vexelDurations.reveal,
      ease: vexelEase,
    },
  },
};
