import type { ReactNode } from "react";

interface EyebrowTagProps {
  children: ReactNode;
  className?: string;
}

export default function EyebrowTag({
  children,
  className = "",
}: EyebrowTagProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium ${className}`}
    >
      {children}
    </span>
  );
}
