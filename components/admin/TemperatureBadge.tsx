import type { LeadScoreTier } from "@/lib/supabase/types";

interface TemperatureBadgeProps {
  tier: LeadScoreTier;
  score?: number;
  showScore?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function TemperatureBadge({
  tier,
  score,
  showScore = false,
  size = "sm",
  className = "",
}: TemperatureBadgeProps) {
  // Distinción visual por forma, densidad de barras y tipografía monoespaciada
  if (tier === "alta") {
    return (
      <span
        title={`Cualificación Alta (${score ?? 0}/100)`}
        className={`inline-flex items-center rounded border border-rose-500/40 bg-rose-950/30 text-rose-300 font-semibold pf-mono ${
          size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5"
        } ${className}`}
      >
        <span aria-hidden="true" className="flex items-center gap-0.5 text-rose-400 tracking-tighter">
          <span>●</span>
          <span>●</span>
          <span>●</span>
        </span>
        <span className="tracking-wide">HOT</span>
        {showScore && score !== undefined && (
          <span className="text-rose-200/60 font-normal pl-0.5 border-l border-rose-500/30">
            {score}
          </span>
        )}
      </span>
    );
  }

  if (tier === "media") {
    return (
      <span
        title={`Cualificación Media (${score ?? 0}/100)`}
        className={`inline-flex items-center rounded border border-amber-500/40 bg-amber-950/30 text-amber-300 font-medium pf-mono ${
          size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5"
        } ${className}`}
      >
        <span aria-hidden="true" className="flex items-center gap-0.5 text-amber-400 tracking-tighter">
          <span>●</span>
          <span>●</span>
          <span className="opacity-30">○</span>
        </span>
        <span className="tracking-wide">WARM</span>
        {showScore && score !== undefined && (
          <span className="text-amber-200/60 font-normal pl-0.5 border-l border-amber-500/30">
            {score}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      title={`Cualificación Baja (${score ?? 0}/100)`}
      className={`inline-flex items-center rounded border border-neutral-800 bg-neutral-900/60 text-neutral-400 font-normal pf-mono ${
        size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5"
      } ${className}`}
    >
      <span aria-hidden="true" className="flex items-center gap-0.5 text-neutral-500 tracking-tighter">
        <span>●</span>
        <span className="opacity-30">○</span>
        <span className="opacity-30">○</span>
      </span>
      <span className="tracking-wide">COLD</span>
      {showScore && score !== undefined && (
        <span className="text-neutral-500 font-normal pl-0.5 border-l border-neutral-800">
          {score}
        </span>
      )}
    </span>
  );
}
