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
      className={`bg-white/5 ring-1 ring-white/10 p-2 rounded-[2rem] ${className}`}
    >
      <div
        className={`bg-[var(--vx-card-core)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.3)] rounded-[calc(2rem-0.375rem)] h-full ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
