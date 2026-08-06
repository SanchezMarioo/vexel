"use client";

import { useEffect, useRef } from "react";

type Variant =
  | "primary"
  | "ink"
  | "outline"
  | "ghost"
  | "inverse-primary"
  | "inverse-outline";
type Size = "sm" | "md" | "lg";

// Mirrors Button.tsx — black & white only, instant colour swap, scale(0.98) press.
const variantStyles: Record<Variant, string> = {
  primary:
    "border border-pf-ink bg-pf-ink text-pf-bg hover:bg-pf-bg hover:text-pf-ink",
  ink: "border border-pf-ink bg-pf-ink text-pf-bg hover:bg-pf-bg hover:text-pf-ink",
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

// El embed de Cal.com (~40 KB) se carga de forma diferida: solo se importa y se
// inicializa la primera vez que el usuario interactúa con un botón (o, como
// respaldo, tras un breve idle). Así no penaliza el JS inicial de la página.
let calApiPromise: Promise<void> | null = null;

function initCalApi() {
  if (calApiPromise) return calApiPromise;
  calApiPromise = import("@calcom/embed-react")
    .then(({ getCalApi }) => getCalApi({ namespace: NAMESPACE }))
    .then((cal) => {
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    });
  return calApiPromise;
}

export default function CalButton({
  calLink,
  children,
  variant = "ink",
  size = "md",
  withArrow = false,
  className = "",
}: CalButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const warm = () => {
      void initCalApi();
    };

    const events: Array<keyof HTMLElementEventMap> = ["pointerenter", "focus", "touchstart"];
    events.forEach((event) =>
      el.addEventListener(event, warm, { once: true, passive: true }),
    );

    // Respaldo: precalienta tras un idle por si se llega al botón por teclado.
    const fallback = window.setTimeout(warm, 2500);

    return () => {
      events.forEach((event) => el.removeEventListener(event, warm));
      window.clearTimeout(fallback);
    };
  }, []);

  const classes = `group cursor-pointer inline-flex select-none items-center justify-center gap-2.5 rounded-[var(--pf-radius)] font-medium leading-none transition-[transform,background-color,border-color,color] duration-150 ease-[var(--pf-ease-quart)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      ref={ref}
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
