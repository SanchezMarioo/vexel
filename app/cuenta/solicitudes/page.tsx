import type { Metadata } from "next";
import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/service";
import { listRequestsByUser } from "@/lib/data/requests";
import type { RequestStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Solicitudes",
};

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
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value));
}

export default async function SolicitudesPage() {
  const currentUser = await requireSessionUser("/cuenta/solicitudes");
  const requests = await listRequestsByUser(currentUser.id);

  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Tus solicitudes</p>
          <h2 className="mt-2 font-display text-3xl text-white">Solicitudes de proyecto</h2>
        </div>
        <Link
          href="/cuenta/solicitar"
          className="rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B51EF]"
        >
          Nueva solicitud
        </Link>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <p className="text-sm text-white/55">Aun no has enviado ninguna solicitud.</p>
          <Link
            href="/cuenta/solicitar"
            className="mt-4 inline-block rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B51EF]"
          >
            Solicitar proyecto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-white/12 bg-black/30 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-white">{req.title}</p>
                  <p className="text-xs text-white/50">
                    {PROJECT_TYPE_LABELS[req.projectType] ?? req.projectType} · {formatDate(req.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_CLASSES[req.status]}`}
                >
                  {STATUS_LABELS[req.status]}
                </span>
              </div>

              {req.adminNote && (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70">
                  <span className="text-white/45">Nota del equipo: </span>
                  {req.adminNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
