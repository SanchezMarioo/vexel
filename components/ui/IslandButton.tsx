import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "dark";
type Size = "md" | "lg";

interface IslandButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "border border-[#8f7aff] bg-[#7B61FF] text-white shadow-[0_14px_35px_rgba(123,97,255,0.35)] hover:bg-[#6B51EF]",
  ghost:
    "border border-white/20 bg-transparent text-white/70 hover:border-white/40 hover:text-white",
  dark: "border border-white/20 bg-black/70 text-white",
};

const arrowStyles: Record<Variant, string> = {
  primary: "bg-white/20",
  ghost: "bg-white/10",
  dark: "bg-white/10",
};

const sizeStyles: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-10 py-5 text-lg",
};

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
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
  size = "md",
  className = "",
}: IslandButtonProps) {
  const base =
    `group inline-flex select-none items-center gap-3 rounded-full font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  const arrowSlot =
    `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${arrowStyles[variant]} transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]`;

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
      <a href={href} className={base} data-cursor-hover="true">
        {inner}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={base} data-cursor-hover="true">
      {inner}
    </button>
  );
}
