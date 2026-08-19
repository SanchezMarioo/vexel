import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getLeadByIdFromSupabase } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TemperatureBadge } from "@/components/admin/TemperatureBadge";
import { StatusSelectDropdown } from "@/components/admin/StatusSelectDropdown";
import { LeadNotesEditor } from "@/components/admin/LeadNotesEditor";
import { DeleteLeadButton } from "@/components/admin/DeleteLeadButton";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLeadByIdFromSupabase(id);

  return {
    title: lead ? `${lead.empresa || lead.nombre} · Lead Xync` : "Detalle del Lead · Xync Admin",
    robots: {
      index: false,
      follow: false,
    },
  };
}

function formatDateFull(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const lead = await getLeadByIdFromSupabase(id);

  if (!lead) {
    notFound();
  }

  const titleName = lead.empresa || lead.nombre;
  const mailtoSubject = encodeURIComponent(`Xync — Sobre tu proyecto de ${lead.tipo}`);
  const mailtoBody = encodeURIComponent(
    `Hola ${lead.nombre},\n\nGracias por contarnos los detalles de tu proyecto a través de nuestra web. Hemos revisado tus respuestas y...\n\nUn saludo,\nEquipo Xync`,
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-white selection:text-black">
      <AdminHeader
        adminEmail={admin.email}
        adminName={admin.name}
        breadcrumbs={[{ label: titleName }]}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Barra superior de navegación y acciones rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/leads"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
              title="Volver a la lista de leads"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="pf-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {titleName}
                </h1>
                {lead.is_update && (
                  <span className="px-2 py-0.5 text-[10px] pf-mono rounded bg-indigo-950 border border-indigo-500/30 text-indigo-300 uppercase">
                    Actualización
                  </span>
                )}
              </div>
              <p className="text-xs pf-mono text-white/50 mt-0.5">
                Registrado el {formatDateFull(lead.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DeleteLeadButton
              leadId={lead.id}
              leadName={titleName}
              redirectUrl="/admin/leads"
            />
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="text-xs pf-mono text-white/50 hidden sm:inline-block">Estado:</div>
            <StatusSelectDropdown leadId={lead.id} currentStatus={lead.status} />
          </div>
        </div>

        {/* Layout en dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Principal: Proyecto, Atribución y Notas (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Datos Clave del Proyecto */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider pf-mono text-white/80">
                  Respuestas del Funnel
                </h2>
                <span className="text-[11px] pf-mono text-white/40 capitalize">
                  {lead.tipo.replace("-", " ")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#0c0c0c] border border-white/10">
                  <span className="text-[11px] pf-mono text-white/40 block mb-1">
                    Situación actual
                  </span>
                  <div className="text-sm font-medium text-white">
                    {lead.situacion}
                  </div>
                  {lead.situacion_detalle && (
                    <div className="mt-2 text-xs text-white/70 bg-white/5 p-2 rounded border border-white/5 pf-mono">
                      &quot;{lead.situacion_detalle}&quot;
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-[#0c0c0c] border border-white/10">
                  <span className="text-[11px] pf-mono text-white/40 block mb-1">
                    Objetivo
                  </span>
                  <div className="text-sm font-medium text-white capitalize">
                    {lead.objetivo ? lead.objetivo.replace("-", " ") : "No especificado"}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0c0c0c] border border-white/10">
                  <span className="text-[11px] pf-mono text-white/40 block mb-1">
                    Inversión estimada
                  </span>
                  <div className="text-base font-bold text-white pf-mono">
                    {lead.presupuesto}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0c0c0c] border border-white/10">
                  <span className="text-[11px] pf-mono text-white/40 block mb-1">
                    Plazo de inicio
                  </span>
                  <div className="text-sm font-medium text-white capitalize">
                    {lead.plazo.replace("-", " ")}
                  </div>
                </div>

                {lead.web_actual && (
                  <div className="p-4 rounded-lg bg-[#0c0c0c] border border-white/10">
                    <span className="text-[11px] pf-mono text-white/40 block mb-1">
                      Web actual / Plataforma
                    </span>
                    <div className="text-sm font-medium text-white capitalize">
                      {lead.web_actual}
                    </div>
                  </div>
                )}

                {lead.catalogo && (
                  <div className="p-4 rounded-lg bg-[#0c0c0c] border border-white/10">
                    <span className="text-[11px] pf-mono text-white/40 block mb-1">
                      Tamaño de catálogo
                    </span>
                    <div className="text-sm font-medium text-white">
                      {lead.catalogo}
                    </div>
                  </div>
                )}
              </div>

              {/* Descripción libre del lead */}
              {lead.descripcion ? (
                <div className="p-5 rounded-lg bg-[#0c0c0c] border border-white/10 space-y-2">
                  <span className="text-[11px] pf-mono text-white/40 block uppercase tracking-wider">
                    Descripción del cliente
                  </span>
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {lead.descripcion}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#080808] border border-dashed border-white/10 text-xs pf-mono text-white/30 text-center">
                  El cliente no incluyó descripción adicional de texto libre.
                </div>
              )}
            </section>

            {/* 2. Atribución y Origen de Marketing */}
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider pf-mono text-white/80">
                  Atribución & Marketing
                </h2>
              </div>

              <div className="p-5 rounded-lg bg-[#0a0a0a] border border-white/10 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pf-mono">
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Landing de entrada</span>
                    <span className="text-white/90 truncate block mt-0.5">
                      {lead.landing_page || "Directo a /empezar"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Referrer externo</span>
                    <span className="text-white/90 truncate block mt-0.5">
                      {lead.referrer || "Directo / Sin referrer"}
                    </span>
                  </div>
                </div>

                {/* UTMs si existen */}
                {(lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.utm_content) && (
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] text-white/40 block uppercase pf-mono mb-2">
                      Parámetros de Campaña (UTM)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {lead.utm_source && (
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs pf-mono text-white/80">
                          source: <strong className="text-white">{lead.utm_source}</strong>
                        </span>
                      )}
                      {lead.utm_medium && (
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs pf-mono text-white/80">
                          medium: <strong className="text-white">{lead.utm_medium}</strong>
                        </span>
                      )}
                      {lead.utm_campaign && (
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs pf-mono text-white/80">
                          campaign: <strong className="text-white">{lead.utm_campaign}</strong>
                        </span>
                      )}
                      {lead.utm_content && (
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs pf-mono text-white/80">
                          content: <strong className="text-white">{lead.utm_content}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Bloc de Notas Internas */}
            <section className="p-5 rounded-lg bg-[#0c0c0c] border border-white/10">
              <LeadNotesEditor leadId={lead.id} initialNotes={lead.notes} />
            </section>
          </div>

          {/* Columna Lateral: Contacto, Scoring & Acciones Rápidas (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Tarjeta de Contacto */}
            <div className="p-5 rounded-lg bg-[#0c0c0c] border border-white/10 space-y-4">
              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider pf-mono text-white/80">
                  Contacto
                </h3>
                <StatusBadge status={lead.status} size="sm" />
              </div>

              <div className="space-y-3 text-xs pf-mono">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Nombre</span>
                  <span className="text-sm font-semibold text-white block mt-0.5">{lead.nombre}</span>
                </div>

                {lead.empresa && (
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">Empresa</span>
                    <span className="text-white block mt-0.5">{lead.empresa}</span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Email</span>
                  <a
                    href={`mailto:${lead.email}?subject=${mailtoSubject}&body=${mailtoBody}`}
                    className="text-white hover:underline block mt-0.5 truncate text-indigo-300"
                  >
                    {lead.email}
                  </a>
                </div>

                {lead.telefono && (
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">Teléfono</span>
                    <a
                      href={`tel:${lead.telefono}`}
                      className="text-white hover:underline block mt-0.5 text-emerald-300"
                    >
                      {lead.telefono}
                    </a>
                  </div>
                )}
              </div>

              {/* Botones de acción directa */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <a
                  href={`mailto:${lead.email}?subject=${mailtoSubject}&body=${mailtoBody}`}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black font-semibold text-xs pf-mono hover:bg-white/90 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Enviar Email</span>
                </a>

                {lead.telefono && (
                  <a
                    href={`tel:${lead.telefono}`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs pf-mono border border-white/10 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Llamar al cliente</span>
                  </a>
                )}
              </div>
            </div>

            {/* Tarjeta de Scoring y Cualificación */}
            <div className="p-5 rounded-lg bg-[#0c0c0c] border border-white/10 space-y-4">
              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider pf-mono text-white/80">
                  Cualificación
                </h3>
                <TemperatureBadge tier={lead.score_tier} score={lead.score_value} />
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs pf-mono text-white/50">Puntuación total</span>
                  <span className="text-2xl font-bold pf-mono tabular-nums text-white">
                    {lead.score_value}
                    <span className="text-xs text-white/40 font-normal"> / 100</span>
                  </span>
                </div>

                {/* Barra de progreso de score */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      lead.score_tier === "alta"
                        ? "bg-rose-500"
                        : lead.score_tier === "media"
                          ? "bg-amber-400"
                          : "bg-neutral-500"
                    }`}
                    style={{ width: `${Math.min(lead.score_value, 100)}%` }}
                  />
                </div>

                {/* Motivos del score */}
                {lead.score_reasons && lead.score_reasons.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-white/40 uppercase pf-mono block mb-1.5">
                      Factores de puntuación:
                    </span>
                    <ul className="space-y-1">
                      {lead.score_reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-white/70 flex items-center gap-1.5 pf-mono">
                          <span className="text-white/30 text-[10px]">✓</span>
                          <span className="capitalize">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
