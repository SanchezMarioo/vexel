import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectStatus } from "@/lib/supabase/types";
import CreateProjectForm from "@/components/admin/CreateProjectForm";

export const metadata: Metadata = { title: "Proyectos" };

const PAGE_SIZE = 10;

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value));
}

function buildHref(page: number, status: string | null) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (status) params.set("status", status);
  const qs = params.toString();
  return `/admin/proyectos${qs ? `?${qs}` : ""}`;
}

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminProyectosPage({ searchParams }: Props) {
  const { page: pageParam, status: statusParam } = await searchParams;

  const validStatuses: ProjectStatus[] = ["draft", "active", "archived"];
  const statusFilter = validStatuses.includes(statusParam as ProjectStatus)
    ? (statusParam as ProjectStatus)
    : null;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const client = getSupabaseAdminClient();

  let query = client
    .from("user_projects")
    .select("id,title,summary,status,updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(`Unable to list projects: ${error.message}`);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filterOptions: { label: string; value: string | null }[] = [
    { label: "Todos", value: null },
    { label: "Activo", value: "active" },
    { label: "Borrador", value: "draft" },
    { label: "Archivado", value: "archived" },
  ];

  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Administracion</p>
          <h2 className="mt-2 font-display text-3xl text-white">Proyectos</h2>
        </div>
        <CreateProjectForm />
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ label, value }) => {
          const isActive = statusFilter === value;
          return (
            <Link
              key={label}
              href={buildHref(1, value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-[#8f7aff]/60 bg-[#7B61FF]/25 text-white"
                  : "border-white/15 bg-white/5 text-white/55 hover:border-white/30 hover:text-white/80"
              }`}
            >
              {label}
            </Link>
          );
        })}
        {total > 0 && (
          <span className="ml-auto self-center text-xs text-white/35">
            {total} proyecto{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Lista */}
      {!data || data.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
          No hay proyectos{statusFilter ? ` con estado "${STATUS_LABELS[statusFilter]}"` : ""}.
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
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    STATUS_CLASSES[project.status as ProjectStatus]
                  }`}
                >
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

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-4">
          <Link
            href={buildHref(page - 1, statusFilter)}
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
                href={buildHref(p, statusFilter)}
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
            href={buildHref(page + 1, statusFilter)}
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
    </article>
  );
}
