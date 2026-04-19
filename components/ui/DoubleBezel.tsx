import type { ReactNode } from "react";

interface DoubleBezelProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export default function DoubleBezel({
  children,
  className = "",
  innerClassName = "",
}: DoubleBezelProps) {
  return (
    <div
      className={`rounded-4xl border border-card-border bg-card p-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${className}`}
    >
      <div
        className={`h-full rounded-3xl border border-card-border bg-[#0f0f12]/85 ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
