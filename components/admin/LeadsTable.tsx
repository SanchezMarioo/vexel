"use client";

import Link from "next/link";
import { TemperatureBadge } from "./TemperatureBadge";
import { StatusSelectDropdown } from "./StatusSelectDropdown";
import { DeleteLeadButton } from "./DeleteLeadButton";
import type { Lead, LeadStatus } from "@/lib/supabase/types";

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onLeadDelete?: (leadId: string) => void;
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const time = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return `Hoy, ${time}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${time}`;
    }

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateStr;
  }
}

export function LeadsTable({ leads, onStatusChange, onLeadDelete }: LeadsTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#080808]">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-white/50 uppercase tracking-wider pf-mono">
            <th className="py-3 px-4">Contacto / Empresa</th>
            <th className="py-3 px-4">Servicio</th>
            <th className="py-3 px-4">Presupuesto</th>
            <th className="py-3 px-4">Plazo</th>
            <th className="py-3 px-4">Cualificación</th>
            <th className="py-3 px-4">Estado</th>
            <th className="py-3 px-4">Fecha</th>
            <th className="py-3 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-xs">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="group hover:bg-white/[0.03] transition-colors duration-150 relative"
            >
              {/* Contacto y Empresa */}
              <td className="py-3.5 px-4">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="block focus:outline-none"
                >
                  <div className="font-semibold text-white group-hover:text-white transition-colors flex items-center gap-2">
                    <span>{lead.empresa || lead.nombre}</span>
                    {lead.is_update && (
                      <span
                        title="Actualizó sus respuestas en el resumen"
                        className="px-1.5 py-0.2 text-[9px] pf-mono rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 uppercase"
                      >
                        Actualizado
                      </span>
                    )}
                  </div>
                  <div className="text-white/50 text-[11px] pf-mono mt-0.5 flex items-center gap-2">
                    {lead.empresa && <span>{lead.nombre} ·</span>}
                    <span className="text-white/40">{lead.email}</span>
                  </div>
                </Link>
              </td>

              {/* Servicio */}
              <td className="py-3.5 px-4">
                <span className="text-white/80 font-medium capitalize">
                  {lead.tipo.replace("-", " ")}
                </span>
                {lead.situacion && (
                  <span className="block text-[11px] text-white/40 truncate max-w-[140px]" title={lead.situacion}>
                    {lead.situacion}
                  </span>
                )}
              </td>

              {/* Presupuesto */}
              <td className="py-3.5 px-4 font-medium text-white/90 tabular-nums pf-mono">
                {lead.presupuesto}
              </td>

              {/* Plazo */}
              <td className="py-3.5 px-4 text-white/70 capitalize">
                {lead.plazo.replace("-", " ")}
              </td>

              {/* Cualificación & Temperatura */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2">
                  <TemperatureBadge
                    tier={lead.score_tier}
                    score={lead.score_value}
                    showScore={true}
                  />
                </div>
              </td>

              {/* Estado */}
              <td className="py-3.5 px-4">
                <StatusSelectDropdown
                  leadId={lead.id}
                  currentStatus={lead.status}
                  onStatusChange={(newStatus) => onStatusChange?.(lead.id, newStatus)}
                />
              </td>

              {/* Fecha */}
              <td className="py-3.5 px-4 text-white/40 text-[11px] pf-mono whitespace-nowrap">
                {formatDate(lead.created_at)}
              </td>

              {/* Acciones */}
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-2 justify-end">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium pf-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
                  >
                    <span>Ver</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <DeleteLeadButton
                    leadId={lead.id}
                    leadName={lead.empresa || lead.nombre}
                    variant="icon"
                    onDeleted={onLeadDelete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
