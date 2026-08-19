"use client";

import Link from "next/link";
import { TemperatureBadge } from "./TemperatureBadge";
import { StatusSelectDropdown } from "./StatusSelectDropdown";
import type { Lead, LeadStatus } from "@/lib/supabase/types";

interface LeadsMobileListProps {
  leads: Lead[];
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function LeadsMobileList({ leads, onStatusChange }: LeadsMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 transition-colors hover:border-white/20 relative"
        >
          {/* Cabecera de la tarjeta: Empresa/Nombre + Temperatura */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <Link href={`/admin/leads/${lead.id}`} className="flex-1 focus:outline-none">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>{lead.empresa || lead.nombre}</span>
                {lead.is_update && (
                  <span className="px-1 text-[8px] pf-mono rounded bg-indigo-950 border border-indigo-500/30 text-indigo-300">
                    UPD
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-white/50 pf-mono mt-0.5 truncate">
                {lead.empresa ? `${lead.nombre} · ` : ""}
                {lead.email}
              </p>
            </Link>

            <TemperatureBadge tier={lead.score_tier} score={lead.score_value} showScore={true} />
          </div>

          {/* Fila de Datos Clave (Servicio, Inversión, Plazo) */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-white/5 pf-mono my-3 text-white/70">
            <div>
              <span className="text-[10px] text-white/40 block">Proyecto</span>
              <span className="text-white capitalize truncate block">{lead.tipo.replace("-", " ")}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block">Inversión</span>
              <span className="text-white font-medium truncate block">{lead.presupuesto}</span>
            </div>
          </div>

          {/* Footer de la tarjeta: Estado interactivo + Enlace al detalle */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <StatusSelectDropdown
              leadId={lead.id}
              currentStatus={lead.status}
              onStatusChange={(newStatus) => onStatusChange?.(lead.id, newStatus)}
            />

            <div className="flex items-center gap-2">
              <span className="text-[10px] pf-mono text-white/40">{formatDate(lead.created_at)}</span>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors"
                title="Ver detalle del lead"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
