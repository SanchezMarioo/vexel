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

// Swiss-industrial high-contrast palette. Fast exponential transitions for responsive feedback.
const variantStyles: Record<Variant, string> = {
  primary:
    "border border-pf-ink bg-pf-ink text-pf-bg hover:bg-pf-bg hover:text-pf-ink hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.15)]",
  ink: "border border-pf-ink bg-pf-ink text-pf-bg hover:bg-pf-bg hover:text-pf-ink hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.15)]",
  // Stable black anchor: solid dark ground with subtle elevation on hover
  solid:
    "border border-pf-ink bg-pf-ink text-pf-bg hover:bg-pf-ink-strong hover:shadow-[0_6px_16px_-4px_oklch(0_0_0/0.25)]",
  outline:
    "border border-pf-ink bg-transparent text-pf-ink hover:bg-pf-ink hover:text-pf-bg hover:shadow-[0_4px_12px_-2px_oklch(0_0_0/0.1)]",
  ghost:
    "border border-transparent bg-transparent text-pf-ink underline-offset-4 hover:underline hover:bg-pf-surface/60",
  "inverse-primary":
    "border border-pf-inverse-ink bg-pf-inverse-ink text-pf-inverse-bg hover:bg-transparent hover:text-pf-inverse-ink hover:shadow-[0_4px_14px_-2px_oklch(1_0_0/0.15)]",
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
  loading?: boolean;
  "aria-label"?: string;
  title?: string;
}

type ButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
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
      className="h-[1.05em] w-[1.05em] transition-transform duration-300 ease-[var(--pf-ease-out)] group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-[1.1em] w-[1.1em] animate-spin text-current"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
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
    loading = false,
  } = props;

  const isDisabled = ("disabled" in props && props.disabled) || loading;

  const classes = `group relative inline-flex select-none items-center justify-center gap-2.5 rounded-[var(--pf-radius)] font-medium leading-none cursor-pointer transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--pf-ease-quart)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const inner = (
    <>
      {loading ? <Spinner /> : null}
      <span className={loading ? "opacity-80" : ""}>{children}</span>
      {withArrow && !loading ? <Arrow /> : null}
    </>
  );

  if (props.href !== undefined) {
    const external = props.href.startsWith("http");
    return (
      <a
        href={props.href}
        target={props.target ?? (external ? "_blank" : undefined)}
        rel={props.rel ?? (external ? "noreferrer noopener" : undefined)}
        aria-label={props["aria-label"]}
        title={props.title}
        className={classes}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={isDisabled}
      onClick={props.onClick}
      aria-label={props["aria-label"]}
      aria-expanded={props["aria-expanded"]}
      aria-controls={props["aria-controls"]}
      aria-busy={loading ? "true" : undefined}
      title={props.title}
      className={classes}
    >
      {inner}
    </button>
  );
}
