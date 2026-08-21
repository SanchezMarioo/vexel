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
  /** Datos precargados en el formulario de Cal.com (nombre, email). */
  prefill?: { name?: string; email?: string };
  /** Se dispara al abrir el overlay de Cal.com (analytics del funnel). */
  onOpen?: () => void;
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
      // Reserva REAL confirmada en Cal.com (no un simple clic): se reemite
      // como evento DOM para que el funnel pueda registrar meeting_booked.
      try {
        (
          cal as unknown as (
            cmd: string,
            cfg: { action: string; callback: () => void },
          ) => void
        )("on", {
          action: "bookingSuccessful",
          callback: () => {
            window.dispatchEvent(new CustomEvent("cal:booking-successful"));
          },
        });
      } catch {
        // Best-effort: sin listener, la reserva simplemente no se reporta.
      }
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
  prefill,
  onOpen,
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
    // Sin timer de respaldo: pointerenter/focus/touchstart ya cubren ratón,
    // teclado y táctil, y precargar a los 2.5s metía ~62KB del embed en la
    // ventana de carga inicial (penalizaba Lighthouse "unused-javascript").

    return () => {
      events.forEach((event) => el.removeEventListener(event, warm));
    };
  }, []);

  const classes = `group cursor-pointer inline-flex select-none items-center justify-center gap-2.5 rounded-[var(--pf-radius)] font-medium leading-none transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--pf-ease-quart)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const hasPrefill = Boolean(prefill?.name || prefill?.email);
  const calConfig = hasPrefill
    ? JSON.stringify({ layout: "month_view", prefill })
    : JSON.stringify({ layout: "month_view" });

  return (
    <button
      ref={ref}
      type="button"
      data-cal-namespace={NAMESPACE}
      data-cal-link={calLink}
      data-cal-config={calConfig}
      onClick={() => onOpen?.()}
      className={classes}
    >
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </button>
  );
}
