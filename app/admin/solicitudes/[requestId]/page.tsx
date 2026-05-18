import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRequestById } from "@/lib/data/requests";
import AdminRequestActions from "@/components/admin/AdminRequestActions";

export const metadata: Metadata = { title: "Revisar solicitud" };

const PROJECT_TYPE_LABELS: Record<string, string> = {
  landing_page: "Landing page",
  local_campaign: "Campana local de temporada",
  ecommerce: "Tienda online",
  other: "Otro",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

interface Props {
  params: Promise<{ requestId: string }>;
}

export default async function AdminRequestDetailPage({ params }: Props) {
  const { requestId } = await params;
  const req = await getRequestById(requestId);

  if (!req) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Solicitud</p>
          <h2 className="mt-2 font-display text-3xl text-white">{req.title}</h2>
          <p className="mt-1 text-sm text-white/50">
            {PROJECT_TYPE_LABELS[req.projectType] ?? req.projectType} · Recibida el {formatDate(req.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            req.status === "pending"
              ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
              : req.status === "accepted"
                ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                : "border-red-300/30 bg-red-400/10 text-red-100"
          }`}
        >
          {STATUS_LABELS[req.status]}
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {req.budget && (
          <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Presupuesto</p>
            <p className="mt-2 text-sm text-white">{req.budget}</p>
          </div>
        )}
        {req.referenceUrl && (
          <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">URL de referencia</p>
            <a
              href={req.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate text-sm text-[#7B61FF] hover:underline"
            >
              {req.referenceUrl}
            </a>
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-white/12 bg-black/25 p-5">
        <h3 className="text-xs uppercase tracking-[0.18em] text-white/50">Descripcion</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/80">{req.description}</p>
      </section>

      {req.adminNote && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-xs uppercase tracking-[0.18em] text-white/50">Nota del equipo</h3>
          <p className="mt-2 text-sm text-white/70">{req.adminNote}</p>
        </section>
      )}

      {req.status === "pending" && (
        <AdminRequestActions requestId={req.id} />
      )}
    </article>
  );
}
