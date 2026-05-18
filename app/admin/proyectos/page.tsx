import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Proyectos" };

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  archived: "Archivado",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  draft: "border-white/20 bg-white/5 text-white/60",
  active: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  archived: "border-white/15 bg-white/3 text-white/40",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminProyectosPage() {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from("user_projects")
    .select("id,user_id,title,summary,status,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to list projects: ${error.message}`);
  }

  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Administracion</p>
        <h2 className="mt-2 font-display text-3xl text-white">Proyectos</h2>
      </header>

      {!data || data.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
          No hay proyectos todavia.
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((project) => (
            <Link
              key={project.id}
              href={`/admin/proyectos/${project.id}`}
              className="block rounded-2xl border border-white/12 bg-black/30 p-5 transition hover:border-white/25 hover:bg-black/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-white">{project.title}</p>
                  <p className="text-xs text-white/50">Actualizado el {formatDate(project.updated_at)}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_CLASSES[project.status as ProjectStatus]}`}>
                  {STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
                </span>
              </div>
              {project.summary && (
                <p className="mt-2 line-clamp-2 text-sm text-white/60">{project.summary}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
