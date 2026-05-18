import type { Metadata } from "next";
import Link from "next/link";
import { listAllRequests } from "@/lib/data/requests";
import type { RequestStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Solicitudes" };

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const STATUS_CLASSES: Record<RequestStatus, string> = {
  pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
  accepted: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  rejected: "border-red-300/30 bg-red-400/10 text-red-100",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  landing_page: "Landing page",
  local_campaign: "Campana local",
  ecommerce: "Tienda online",
  other: "Otro",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function AdminSolicitudesPage() {
  const requests = await listAllRequests();

  const pending = requests.filter((r) => r.status === "pending");
  const rest = requests.filter((r) => r.status !== "pending");
  const sorted = [...pending, ...rest];

  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Administracion</p>
        <h2 className="mt-2 font-display text-3xl text-white">Solicitudes</h2>
      </header>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
          No hay solicitudes todavia.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((req) => (
            <Link
              key={req.id}
              href={`/admin/solicitudes/${req.id}`}
              className="block rounded-2xl border border-white/12 bg-black/30 p-5 transition hover:border-white/25 hover:bg-black/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-white">{req.title}</p>
                  <p className="text-xs text-white/50">
                    {PROJECT_TYPE_LABELS[req.projectType] ?? req.projectType} · {formatDate(req.createdAt)}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_CLASSES[req.status]}`}>
                  {STATUS_LABELS[req.status]}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-white/60">{req.description}</p>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
