"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { AppProject } from "@/lib/data/projects";

interface ProjectEditFormProps {
  project: AppProject;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "archived", label: "Archivado" },
];

export default function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    const budgetRaw = String(formData.get("budgetFinal") ?? "").trim();
    const daysRaw = String(formData.get("estimatedDays") ?? "").trim();

    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim() || null,
      status: String(formData.get("status") ?? ""),
      budgetFinal: budgetRaw ? parseFloat(budgetRaw) : null,
      estimatedDays: daysRaw ? parseInt(daysRaw, 10) : null,
      adminNotes: String(formData.get("adminNotes") ?? "").trim() || null,
    };

    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo guardar el proyecto.");
        setIsSaving(false);
        return;
      }

      setSuccessMessage("Proyecto actualizado correctamente.");
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion. Intentalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/12 bg-black/25 p-5">
      <h3 className="font-display text-xl text-white">Editar proyecto</h3>

      {successMessage && (
        <p className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">
          {errorMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-white/75">Titulo</span>
            <input
              type="text"
              name="title"
              required
              defaultValue={project.title}
              className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">Estado</span>
            <select
              name="status"
              defaultValue={project.status}
              className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0c0c0e]">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-white/75">Descripcion</span>
          <textarea
            name="summary"
            rows={4}
            defaultValue={project.summary ?? ""}
            className="w-full resize-none rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-white/75">
              Presupuesto final <span className="text-white/40">(€)</span>
            </span>
            <input
              type="number"
              name="budgetFinal"
              min="0"
              step="0.01"
              defaultValue={project.budgetFinal ?? ""}
              placeholder="0.00"
              className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-white/75">
              Tiempo estimado <span className="text-white/40">(dias)</span>
            </span>
            <input
              type="number"
              name="estimatedDays"
              min="1"
              step="1"
              defaultValue={project.estimatedDays ?? ""}
              placeholder="Ej: 14"
              className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-white/75">
            Notas internas <span className="text-white/40">(solo visibles para el admin)</span>
          </span>
          <textarea
            name="adminNotes"
            rows={3}
            defaultValue={project.adminNotes ?? ""}
            placeholder="Anotaciones internas del equipo..."
            className="w-full resize-none rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B51EF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
