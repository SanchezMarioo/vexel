import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/service";
import { listProjectsByUser } from "@/lib/data/projects";

export default async function AccountOverviewPage() {
  const currentUser = await requireSessionUser("/cuenta");
  const projects = await listProjectsByUser(currentUser.id);
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const latestProject = projects[0] ?? null;

  return (
    <div className="space-y-7">
      <header>
        <h2 className="font-display text-3xl text-white">Resumen</h2>
        <p className="mt-2 text-sm text-white/70">
          Aqui tienes una vista rapida de tu cuenta y el estado actual de tus proyectos.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-white/12 bg-black/35 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Proyectos totales</p>
          <p className="mt-3 font-display text-4xl text-white">{projects.length}</p>
        </article>

        <article className="rounded-2xl border border-white/12 bg-black/35 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Proyectos activos</p>
          <p className="mt-3 font-display text-4xl text-white">{activeProjects}</p>
        </article>
      </div>

      {latestProject ? (
        <article className="rounded-2xl border border-white/12 bg-black/30 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Ultimo proyecto actualizado</p>
          <h3 className="mt-3 font-display text-2xl text-white">{latestProject.title}</h3>
          <p className="mt-2 text-sm text-white/70">{latestProject.summary ?? "Sin descripcion."}</p>

          <Link
            href={`/cuenta/proyectos/${latestProject.id}`}
            className="mt-5 inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Ver detalle
          </Link>
        </article>
      ) : (
        <article className="rounded-2xl border border-dashed border-white/18 bg-black/20 p-5">
          <h3 className="font-display text-2xl text-white">Todavia no hay proyectos</h3>
          <p className="mt-2 text-sm text-white/70">
            En cuanto empecemos uno, aparecera aqui automaticamente.
          </p>
        </article>
      )}
    </div>
  );
}