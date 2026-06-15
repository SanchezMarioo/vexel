"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

type Variant = "primary" | "ink" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-pf-violet-700 text-white hover:bg-pf-violet-900",
  ink: "bg-pf-ink text-pf-bg hover:bg-pf-violet-700",
  outline:
    "border border-pf-line-strong text-pf-ink hover:border-pf-ink hover:bg-pf-ink hover:text-pf-bg",
  ghost: "text-pf-ink hover:text-pf-violet-700",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-[0.95rem]",
  lg: "px-7 py-4 text-base",
};

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[1.05em] w-[1.05em] transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

interface CalButtonProps {
  calLink: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
}

const NAMESPACE = "book";

export default function CalButton({
  calLink,
  children,
  variant = "ink",
  size = "md",
  withArrow = false,
  className = "",
}: CalButtonProps) {
  useEffect(() => {
    void getCalApi({ namespace: NAMESPACE }).then((cal) => {
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    });
  }, []);

  const classes = `group inline-flex select-none items-center justify-center gap-2.5 rounded-[var(--pf-radius)] font-medium leading-none transition-colors duration-200 ease-[var(--pf-ease)] ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      type="button"
      data-cal-namespace={NAMESPACE}
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      className={classes}
    >
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </button>
  );
}
