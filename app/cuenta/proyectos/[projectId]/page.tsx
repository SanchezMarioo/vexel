import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/service";
import { getProjectByIdForUser } from "@/lib/data/projects";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  const currentUser = await requireSessionUser(`/cuenta/proyectos/${projectId}`);
  const project = await getProjectByIdForUser(currentUser.id, projectId);

  if (!project) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Detalle de proyecto</p>
        <h2 className="mt-2 font-display text-3xl text-white">{project.title}</h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Estado</p>
          <p className="mt-2 text-sm text-white">{project.status}</p>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Creado</p>
          <p className="mt-2 text-sm text-white">{formatDate(project.createdAt)}</p>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Ultima actualizacion</p>
          <p className="mt-2 text-sm text-white">{formatDate(project.updatedAt)}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/12 bg-black/25 p-5">
        <h3 className="font-display text-2xl text-white">Descripcion</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          {project.summary ?? "Este proyecto aun no tiene descripcion."}
        </p>
      </section>
    </article>
  );
}