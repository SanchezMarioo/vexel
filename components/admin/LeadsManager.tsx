"use client";

import { useState, useMemo } from "react";
import { LeadsFilterBar, type FilterStatus, type SortOption } from "./LeadsFilterBar";
import { LeadsTable } from "./LeadsTable";
import { LeadsMobileList } from "./LeadsMobileList";
import { EmptyState } from "./EmptyState";
import type { Lead, LeadStats, LeadScoreTier, LeadStatus } from "@/lib/supabase/types";

interface LeadsManagerProps {
  initialLeads: Lead[];
  stats: LeadStats;
}

export function LeadsManager({ initialLeads, stats }: LeadsManagerProps) {
  const [leadsList, setLeadsList] = useState<Lead[]>(initialLeads);
  const [currentStatus, setCurrentStatus] = useState<FilterStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<LeadScoreTier | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeadsList((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)),
    );
  };

  const filteredLeads = useMemo(() => {
    return leadsList
      .filter((lead) => {
        // Filtro de estado
        if (currentStatus !== "todos" && lead.status !== currentStatus) {
          return false;
        }

        // Filtro de temperatura
        if (tierFilter !== "all" && lead.score_tier !== tierFilter) {
          return false;
        }

        // Filtro de búsqueda
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = lead.nombre?.toLowerCase().includes(term);
          const matchCompany = lead.empresa?.toLowerCase().includes(term);
          const matchEmail = lead.email?.toLowerCase().includes(term);
          const matchType = lead.tipo?.toLowerCase().includes(term);
          if (!matchName && !matchCompany && !matchEmail && !matchType) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "date_asc") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "score_desc") {
          return b.score_value - a.score_value;
        }
        if (sortBy === "score_asc") {
          return a.score_value - b.score_value;
        }
        return 0;
      });
  }, [leadsList, currentStatus, tierFilter, searchTerm, sortBy]);

  const hasActiveFilters = currentStatus !== "todos" || tierFilter !== "all" || searchTerm.length > 0;

  const handleResetFilters = () => {
    setCurrentStatus("todos");
    setTierFilter("all");
    setSearchTerm("");
    setSortBy("date_desc");
  };

  return (
    <div className="space-y-6">
      {/* Barra de herramientas / filtros */}
      <LeadsFilterBar
        currentStatus={currentStatus}
        onStatusChange={setCurrentStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        tierFilter={tierFilter}
        onTierChange={setTierFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        stats={stats}
      />

      {/* Listado / Tabla */}
      {filteredLeads.length > 0 ? (
        <>
          {/* Vista de escritorio (Table) */}
          <div className="hidden md:block">
            <LeadsTable leads={filteredLeads} onStatusChange={handleStatusChange} />
          </div>

          {/* Vista móvil (Cards) */}
          <LeadsMobileList leads={filteredLeads} onStatusChange={handleStatusChange} />

          <div className="flex items-center justify-between text-[11px] pf-mono text-white/40 pt-2 px-1">
            <span>Mostrando {filteredLeads.length} de {leadsList.length} leads</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          title={
            leadsList.length === 0
              ? "Aún no hay leads registrados"
              : "No se encontraron leads coincidentes"
          }
          description={
            leadsList.length === 0
              ? "Cuando los usuarios completen el funnel en /empezar, aparecerán automáticamente en esta lista."
              : "Prueba a cambiar el término de búsqueda o quitar los filtros de estado/temperatura."
          }
          onReset={handleResetFilters}
          hasFilters={hasActiveFilters}
        />
      )}
    </div>
  );
}
