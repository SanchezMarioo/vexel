import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/service";
import { listProjectsByUser } from "@/lib/data/projects";

export default async function AccountProjectsPage() {
  const currentUser = await requireSessionUser("/cuenta/proyectos");
  const projects = await listProjectsByUser(currentUser.id);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-white">Tus proyectos</h2>
        <p className="mt-2 text-sm text-white/70">Listado privado de proyectos asociados a tu cuenta.</p>
      </header>

      {projects.length === 0 ? (
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

                <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/75">
                  {project.status}
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
    </div>
  );
}