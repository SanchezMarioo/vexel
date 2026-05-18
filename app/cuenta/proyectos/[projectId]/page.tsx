import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/service";
import { getProjectByIdForUser } from "@/lib/data/projects";
import { listMessagesByProject } from "@/lib/data/messages";
import { listPaymentsByProject } from "@/lib/data/payments";
import MessageThread from "@/components/account/MessageThread";
import type { AppPayment } from "@/lib/data/payments";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  active: "Activo",
  archived: "Archivado",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value + "T00:00:00"));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function PaymentsList({ payments }: { payments: AppPayment[] }) {
  if (payments.length === 0) return null;

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const paid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);

  return (
    <section className="rounded-2xl border border-white/12 bg-black/25 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl text-white">Plan de pagos</h3>
        <div className="flex gap-4 text-xs text-white/55">
          <span>Total: <span className="text-white">{formatCurrency(total)}</span></span>
          <span>Pendiente: <span className="text-yellow-200">{formatCurrency(total - paid)}</span></span>
        </div>
      </div>

      <div className="space-y-2">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white">{payment.description}</p>
              <p className="text-xs text-white/50">
                {formatCurrency(payment.amount)}
                {payment.dueDate && ` · Vence el ${formatDateShort(payment.dueDate)}`}
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                payment.status === "paid"
                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                  : "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
              }`}
            >
              {payment.status === "paid" ? "Pagado" : "Pendiente"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  const currentUser = await requireSessionUser(`/cuenta/proyectos/${projectId}`);

  const [project, messages, payments] = await Promise.all([
    getProjectByIdForUser(currentUser.id, projectId),
    listMessagesByProject(projectId).catch(() => []),
    listPaymentsByProject(projectId).catch(() => []),
  ]);

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
          <p className="mt-2 text-sm text-white">{STATUS_LABELS[project.status] ?? project.status}</p>
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

      {(project.budgetFinal !== null || project.estimatedDays !== null) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {project.budgetFinal !== null && (
            <div className="rounded-2xl border border-[#8f7aff]/30 bg-[#7B61FF]/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Presupuesto acordado</p>
              <p className="mt-2 font-display text-2xl text-white">{formatCurrency(project.budgetFinal)}</p>
            </div>
          )}
          {project.estimatedDays !== null && (
            <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Tiempo estimado</p>
              <p className="mt-2 font-display text-2xl text-white">
                {project.estimatedDays} <span className="text-base font-sans text-white/60">dias</span>
              </p>
            </div>
          )}
        </div>
      )}

      <section className="rounded-2xl border border-white/12 bg-black/25 p-5">
        <h3 className="font-display text-2xl text-white">Descripcion</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          {project.summary ?? "Este proyecto aun no tiene descripcion."}
        </p>
      </section>

      <PaymentsList payments={payments} />

      <section className="rounded-2xl border border-white/12 bg-black/25 p-5">
        <MessageThread
          projectId={project.id}
          messages={messages}
          currentUserRole="user"
          currentUserName={currentUser.name ?? currentUser.email}
          otherPartyName="Equipo Vexel"
        />
      </section>
    </article>
  );
}
