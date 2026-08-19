"use client";

import { useId } from "react";
import type { LeadStatus, LeadStats, LeadScoreTier } from "@/lib/supabase/types";

export type FilterStatus = LeadStatus | "todos";
export type SortOption = "date_desc" | "date_asc" | "score_desc" | "score_asc";

interface LeadsFilterBarProps {
  currentStatus: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  tierFilter: LeadScoreTier | "all";
  onTierChange: (tier: LeadScoreTier | "all") => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  stats: LeadStats;
}

const TABS: { id: FilterStatus; label: string; countKey?: keyof LeadStats }[] = [
  { id: "todos", label: "Todos", countKey: "total" },
  { id: "nuevo", label: "Nuevos", countKey: "nuevo" },
  { id: "contactado", label: "Contactados", countKey: "contactado" },
  { id: "llamada_agendada", label: "Llamada agendada", countKey: "llamada_agendada" },
  { id: "propuesta_enviada", label: "Propuesta", countKey: "propuesta_enviada" },
  { id: "ganado", label: "Ganados", countKey: "ganado" },
  { id: "perdido", label: "Perdidos", countKey: "perdido" },
];

export function LeadsFilterBar({
  currentStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  tierFilter,
  onTierChange,
  sortBy,
  onSortChange,
  stats,
}: LeadsFilterBarProps) {
  const searchInputId = useId();
  const sortSelectId = useId();
  const tierSelectId = useId();

  return (
    <div className="space-y-4">
      {/* Pestañas de estado estilo Segmented Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
        {TABS.map((tab) => {
          const isActive = currentStatus === tab.id;
          const count = tab.countKey ? stats[tab.countKey] : 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium pf-mono whitespace-nowrap transition-all duration-150 relative cursor-pointer border-b-2 -mb-[1px] ${
                isActive
                  ? "border-white text-white font-semibold"
                  : "border-transparent text-white/50 hover:text-white/80 hover:border-white/20"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums transition-colors ${
                  isActive
                    ? "bg-white text-black font-bold"
                    : "bg-white/10 text-white/60 group-hover:bg-white/15"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controles de Búsqueda, Temperatura y Ordenación */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor={searchInputId} className="sr-only">
            Buscar lead por nombre, empresa o email
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id={searchInputId}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, empresa o email..."
            className="w-full bg-[#0d0d0d] hover:bg-[#121212] focus:bg-[#101010] border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/40 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-white/30 pf-mono transition-colors outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Limpiar búsqueda"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {/* Filtros rápidos: Temperatura y Ordenación */}
        <div className="flex items-center gap-2">
          {/* Selector de Temperatura */}
          <div className="relative">
            <label htmlFor={tierSelectId} className="sr-only">
              Filtrar por temperatura
            </label>
            <select
              id={tierSelectId}
              value={tierFilter}
              onChange={(e) => onTierChange(e.target.value as LeadScoreTier | "all")}
              className="appearance-none bg-[#0d0d0d] hover:bg-[#141414] border border-white/15 focus:border-white/40 rounded-lg pl-3 pr-7 py-1.5 text-xs pf-mono text-white/80 transition-colors cursor-pointer outline-none"
            >
              <option value="all">Todas las temp.</option>
              <option value="alta">HOT (Alta cualificación)</option>
              <option value="media">WARM (Media)</option>
              <option value="baja">COLD (Baja)</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/40">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Selector de Ordenación */}
          <div className="relative">
            <label htmlFor={sortSelectId} className="sr-only">
              Ordenar leads
            </label>
            <select
              id={sortSelectId}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-[#0d0d0d] hover:bg-[#141414] border border-white/15 focus:border-white/40 rounded-lg pl-3 pr-7 py-1.5 text-xs pf-mono text-white/80 transition-colors cursor-pointer outline-none"
            >
              <option value="date_desc">Más recientes</option>
              <option value="date_asc">Más antiguos</option>
              <option value="score_desc">Mayor Score</option>
              <option value="score_asc">Menor Score</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/40">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
