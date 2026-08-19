import type { LeadStatus } from "@/lib/supabase/types";

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; dotColor: string; bgClass: string; textClass: string; borderClass: string }
> = {
  nuevo: {
    label: "Nuevo",
    dotColor: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    bgClass: "bg-cyan-950/40",
    textClass: "text-cyan-200",
    borderClass: "border-cyan-500/30",
  },
  contactado: {
    label: "Contactado",
    dotColor: "bg-amber-400",
    bgClass: "bg-amber-950/40",
    textClass: "text-amber-200",
    borderClass: "border-amber-500/30",
  },
  llamada_agendada: {
    label: "Llamada agendada",
    dotColor: "bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.5)]",
    bgClass: "bg-indigo-950/40",
    textClass: "text-indigo-200",
    borderClass: "border-indigo-500/30",
  },
  propuesta_enviada: {
    label: "Propuesta enviada",
    dotColor: "bg-orange-400",
    bgClass: "bg-orange-950/40",
    textClass: "text-orange-200",
    borderClass: "border-orange-500/30",
  },
  ganado: {
    label: "Ganado",
    dotColor: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    bgClass: "bg-emerald-950/40",
    textClass: "text-emerald-200",
    borderClass: "border-emerald-500/30",
  },
  perdido: {
    label: "Perdido",
    dotColor: "bg-neutral-500",
    bgClass: "bg-neutral-900/60",
    textClass: "text-neutral-400",
    borderClass: "border-neutral-800",
  },
};

interface StatusBadgeProps {
  status: LeadStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.nuevo;

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1.5"
      : "text-xs px-2.5 py-1 gap-2 font-medium";

  return (
    <span
      className={`inline-flex items-center rounded-full border pf-mono transition-colors ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotColor}`}
      />
      <span>{config.label}</span>
    </span>
  );
}
