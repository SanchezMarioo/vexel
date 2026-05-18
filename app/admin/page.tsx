import type { Metadata } from "next";
import { listAllRequests } from "@/lib/data/requests";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const client = getSupabaseAdminClient();

  const [pendingRequests, allProjects, allUsers] = await Promise.all([
    listAllRequests("pending"),
    client.from("user_projects").select("id", { count: "exact", head: true }),
    client.from("user_accounts").select("id", { count: "exact", head: true }).eq("role", "user"),
  ]);

  return {
    pendingCount: pendingRequests.length,
    projectsCount: allProjects.count ?? 0,
    usersCount: allUsers.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Resumen</p>
        <h2 className="mt-2 font-display text-3xl text-white">Dashboard</h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Solicitudes pendientes</p>
          <p className="mt-3 font-display text-4xl text-white">{stats.pendingCount}</p>
          <a href="/admin/solicitudes" className="mt-3 inline-block text-xs text-[#7B61FF] hover:underline">
            Ver solicitudes →
          </a>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/30 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Proyectos totales</p>
          <p className="mt-3 font-display text-4xl text-white">{stats.projectsCount}</p>
          <a href="/admin/proyectos" className="mt-3 inline-block text-xs text-[#7B61FF] hover:underline">
            Ver proyectos →
          </a>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/30 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Usuarios registrados</p>
          <p className="mt-3 font-display text-4xl text-white">{stats.usersCount}</p>
        </div>
      </div>
    </article>
  );
}
