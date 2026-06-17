import type { ReactNode } from "react";

type Variant = "line" | "solid";

const variantStyles: Record<Variant, string> = {
  line: "border border-pf-line text-pf-ink-soft",
  solid: "bg-pf-ink text-pf-bg",
};

interface TagProps {
  children: ReactNode;
  variant?: Variant;
  mono?: boolean;
  className?: string;
}

export default function Tag({
  children,
  variant = "line",
  mono = false,
  className = "",
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--pf-radius-sm)] px-2.5 py-1 text-xs leading-none ${
        mono ? "pf-mono" : "font-medium"
      } ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
