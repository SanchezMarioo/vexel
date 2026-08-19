import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getLeadsStatsFromSupabase, getLeadsFromSupabase } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LeadsManager } from "@/components/admin/LeadsManager";

export const metadata: Metadata = {
  title: "Gestión de Leads · Xync Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLeadsPage() {
  const admin = await requireAdmin();
  const stats = await getLeadsStatsFromSupabase();
  const { leads, error } = await getLeadsFromSupabase({ limit: 200 });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-white selection:text-black">
      {/* Header global de administración */}
      <AdminHeader adminEmail={admin.email} adminName={admin.name} />

      {/* Contenido principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="pf-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Leads del Funnel
            </h1>
            <p className="text-xs sm:text-sm text-white/50 pf-mono mt-1">
              Registro centralizado de contactos y cualificación de /empezar
            </p>
          </div>

          {/* Tarjetas métricas compactas (Headlines) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 flex flex-col">
              <span className="text-[10px] pf-mono text-white/40 uppercase tracking-wider">
                Total
              </span>
              <span className="text-lg font-bold pf-mono tabular-nums text-white">
                {stats.total}
              </span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 flex flex-col">
              <span className="text-[10px] pf-mono text-cyan-300/70 uppercase tracking-wider">
                Nuevos
              </span>
              <span className="text-lg font-bold pf-mono tabular-nums text-cyan-200">
                {stats.nuevo}
              </span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex flex-col">
              <span className="text-[10px] pf-mono text-indigo-300/70 uppercase tracking-wider">
                Llamadas
              </span>
              <span className="text-lg font-bold pf-mono tabular-nums text-indigo-200">
                {stats.llamada_agendada}
              </span>
            </div>

            <div className="px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex flex-col">
              <span className="text-[10px] pf-mono text-emerald-300/70 uppercase tracking-wider">
                Ganados
              </span>
              <span className="text-lg font-bold pf-mono tabular-nums text-emerald-200">
                {stats.ganado}
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de error / aviso si hay problemas con Supabase */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs pf-mono flex items-center gap-3">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Gestor interactivo con tabla, filtros y cards móviles */}
        <LeadsManager initialLeads={leads} stats={stats} />
      </main>
    </div>
  );
}
