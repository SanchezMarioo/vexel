"use client";

import { useState, useTransition, useId } from "react";
import { updateLeadStatusAction } from "@/app/admin/actions";
import { STATUS_CONFIG } from "./StatusBadge";
import type { LeadStatus } from "@/lib/supabase/types";

interface StatusSelectDropdownProps {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange?: (newStatus: LeadStatus) => void;
  className?: string;
}

const ALL_STATUSES: LeadStatus[] = [
  "nuevo",
  "contactado",
  "llamada_agendada",
  "propuesta_enviada",
  "ganado",
  "perdido",
];

export function StatusSelectDropdown({
  leadId,
  currentStatus,
  onStatusChange,
  className = "",
}: StatusSelectDropdownProps) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const selectId = useId();

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === status) return;

    // Actualización optimista
    const prevStatus = status;
    setStatus(newStatus);
    setFeedback("Guardando...");

    startTransition(async () => {
      try {
        const res = await updateLeadStatusAction(leadId, newStatus);
        if (res.ok) {
          onStatusChange?.(newStatus);
          setFeedback("Actualizado");
          setTimeout(() => setFeedback(null), 2000);
        } else {
          setStatus(prevStatus);
          setFeedback("Error al guardar");
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch {
        setStatus(prevStatus);
        setFeedback("Error al guardar");
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  const currentConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.nuevo;

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <label htmlFor={selectId} className="sr-only">
        Cambiar estado del lead
      </label>
      
      <div className="relative group">
        <select
          id={selectId}
          value={status}
          disabled={isPending}
          onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
          className="appearance-none bg-[#111] hover:bg-[#181818] border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/40 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium pf-mono text-white cursor-pointer transition-colors outline-none disabled:opacity-50"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#111] text-white">
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>

        {/* Flecha personalizada */}
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white/70 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Dot de estado dinámico */}
      <span
        aria-hidden="true"
        className={`w-2 h-2 rounded-full transition-all ${currentConfig.dotColor}`}
      />

      {feedback && (
        <span
          className={`text-[11px] pf-mono transition-opacity ${
            feedback === "Error al guardar" ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          {feedback}
        </span>
      )}
    </div>
  );
}
