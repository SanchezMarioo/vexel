import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectStatus } from "@/lib/supabase/types";

const PAGE_SIZE = 8;

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  archived: "Archivado",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  draft: "border-white/20 bg-white/5 text-white/60",
  active: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  archived: "border-white/15 bg-white/5 text-white/40",
};

function buildHref(page: number) {
  return page > 1 ? `/cuenta/proyectos?page=${page}` : "/cuenta/proyectos";
}

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountProjectsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentUser = await requireSessionUser("/cuenta/proyectos");

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const client = getSupabaseAdminClient();
  const { data: projects, error, count } = await client
    .from("user_projects")
    .select("id,title,summary,status,updated_at", { count: "exact" })
    .eq("user_id", currentUser.id)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Unable to list projects: ${error.message}`);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-3xl text-white">Tus proyectos</h2>
          <p className="mt-2 text-sm text-white/70">Listado de proyectos asociados a tu cuenta.</p>
        </div>
        {total > 0 && (
          <span className="self-end text-xs text-white/35">
            {total} proyecto{total !== 1 ? "s" : ""}
          </span>
        )}
      </header>

      {!projects || projects.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-white/18 bg-black/20 p-5">
          <p className="text-sm text-white/70">No hay proyectos todavia.</p>
        </article>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id} className="rounded-2xl border border-white/12 bg-black/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-white">{project.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{project.summary ?? "Sin descripcion"}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    STATUS_CLASSES[project.status as ProjectStatus]
                  }`}
                >
                  {STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
                </span>
              </div>
              <Link
                href={`/cuenta/proyectos/${project.id}`}
                className="mt-4 inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/5"
              >
                Abrir proyecto
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-4">
          <Link
            href={buildHref(page - 1)}
            aria-disabled={page <= 1}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
              page <= 1
                ? "pointer-events-none border-white/8 text-white/25"
                : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            ← Anterior
          </Link>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildHref(p)}
                className={`h-8 w-8 rounded-xl border text-center text-xs font-medium leading-8 transition ${
                  p === page
                    ? "border-[#8f7aff]/50 bg-[#7B61FF]/20 text-white"
                    : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>

          <Link
            href={buildHref(page + 1)}
            aria-disabled={page >= totalPages}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
              page >= totalPages
                ? "pointer-events-none border-white/8 text-white/25"
                : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            Siguiente →
          </Link>
        </nav>
      )}
    </div>
  );
}
