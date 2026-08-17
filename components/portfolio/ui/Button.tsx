import type { ReactNode } from "react";

type Variant =
  | "primary"
  | "ink"
  | "solid"
  | "outline"
  | "ghost"
  | "inverse-primary"
  | "inverse-outline";
type Size = "sm" | "md" | "lg";

// Black & white only. Colour/transform changes ease over 150ms (ease-out-quart).
const variantStyles: Record<Variant, string> = {
  primary:
    "border border-pf-ink bg-pf-ink text-pf-bg hover:bg-pf-bg hover:text-pf-ink",
  ink: "border border-pf-ink bg-pf-ink text-pf-bg hover:bg-pf-bg hover:text-pf-ink",
  // Stable black anchor: no colour change, the only feedback is a scale press.
  solid:
    "border border-pf-ink bg-pf-ink text-pf-bg hover:scale-[0.98] motion-reduce:hover:scale-100",
  outline:
    "border border-pf-ink bg-transparent text-pf-ink hover:bg-pf-ink hover:text-pf-bg",
  ghost:
    "border border-transparent bg-transparent text-pf-ink underline-offset-4 hover:underline",
  "inverse-primary":
    "border border-pf-inverse-ink bg-pf-inverse-ink text-pf-inverse-bg hover:bg-transparent hover:text-pf-inverse-ink",
  "inverse-outline":
    "border border-pf-inverse-ink bg-transparent text-pf-inverse-ink hover:bg-pf-inverse-ink hover:text-pf-inverse-bg",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-[0.95rem]",
  lg: "px-7 py-4 text-base",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
}

type ButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

type AnchorProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

type Props = ButtonProps | AnchorProps;

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

export default function Button(props: Props) {
  const {
    children,
    variant = "primary",
    size = "md",
    withArrow = false,
    className = "",
  } = props;

  const classes = `group inline-flex select-none items-center justify-center gap-2.5 rounded-[var(--pf-radius)] font-medium leading-none transition-[transform,background-color,border-color,color] duration-150 ease-[var(--pf-ease-quart)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const inner = (
    <>
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </>
  );

  if (props.href !== undefined) {
    const external = props.href.startsWith("http");
    return (
      <a
        href={props.href}
        target={props.target ?? (external ? "_blank" : undefined)}
        rel={props.rel ?? (external ? "noreferrer noopener" : undefined)}
        className={classes}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={classes}
    >
      {inner}
    </button>
  );
}
