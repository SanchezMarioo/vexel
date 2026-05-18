import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectById } from "@/lib/data/projects";
import { listMessagesByProject } from "@/lib/data/messages";
import { listPaymentsByProject } from "@/lib/data/payments";
import { findUserById } from "@/lib/data/users";
import MessageThread from "@/components/account/MessageThread";
import ProjectEditForm from "@/components/admin/ProjectEditForm";
import PaymentsManager from "@/components/admin/PaymentsManager";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export const metadata: Metadata = { title: "Detalle de proyecto" };

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function AdminProjectDetailPage({ params }: Props) {
  const { projectId } = await params;

  const [project, messages, payments] = await Promise.all([
    getProjectById(projectId),
    listMessagesByProject(projectId),
    listPaymentsByProject(projectId),
  ]);

  if (!project) {
    notFound();
  }

  const projectUser = await findUserById(project.userId);
  const clientName = projectUser?.name ?? projectUser?.email ?? "Cliente";

  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Proyecto</p>
          <h2 className="mt-2 font-display text-3xl text-white">{project.title}</h2>
          <p className="mt-1 text-sm text-white/50">Cliente: {clientName}</p>
        </div>
        <DeleteProjectButton projectId={project.id} />
      </header>

      <ProjectEditForm project={project} />

      <PaymentsManager projectId={project.id} payments={payments} />

      <section className="rounded-2xl border border-white/12 bg-black/25 p-5">
        <MessageThread
          projectId={project.id}
          messages={messages}
          currentUserRole="admin"
          currentUserName="Equipo Vexel"
          otherPartyName={clientName}
        />
      </section>
    </article>
  );
}
