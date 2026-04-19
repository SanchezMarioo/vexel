"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "dark";

interface IslandButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-violet text-white",
  ghost:   "bg-white/5 ring-1 ring-white/10 text-white",
  dark:    "bg-[#0a0a0a] text-[#faf9f6]",
};

const arrowStyles: Record<Variant, string> = {
  primary: "bg-white/20",
  ghost:   "bg-white/10",
  dark:    "bg-white/10",
};

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}

export default function IslandButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
}: IslandButtonProps) {
  const base = `inline-flex items-center gap-3 rounded-full pl-5 pr-1.5 py-1.5 font-medium text-sm cursor-pointer select-none ${variantStyles[variant]} ${className}`;
  const arrowSlot = `w-8 h-8 rounded-full ${arrowStyles[variant]} flex items-center justify-center flex-shrink-0`;

  const inner = (
    <>
      <span>{children}</span>
      <span className={arrowSlot}>
        <ArrowIcon />
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={base}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={springTransition}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={base}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springTransition}
    >
      {inner}
    </motion.button>
  );
}
