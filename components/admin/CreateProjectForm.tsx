"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function CreateProjectForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(form);
    const payload = {
      userEmail: String(formData.get("userEmail") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim() || null,
      status: String(formData.get("status") ?? "draft"),
    };

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo crear el proyecto.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/admin/proyectos/${data.project.id}`);
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion. Intentalo de nuevo.");
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/10"
      >
        + Nuevo proyecto
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/12 bg-black/30 p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Nuevo proyecto</p>
        <button
          type="button"
          onClick={() => { setOpen(false); setErrorMessage(null); }}
          className="text-xs text-white/40 hover:text-white/70"
        >
          Cancelar
        </button>
      </div>

      {errorMessage && (
        <p className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs text-white/65">Email del cliente</span>
          <input
            type="email"
            name="userEmail"
            required
            placeholder="cliente@ejemplo.com"
            className="w-full rounded-2xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-white/65">Titulo</span>
          <input
            type="text"
            name="title"
            required
            maxLength={200}
            placeholder="Nombre del proyecto"
            className="w-full rounded-2xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs text-white/65">Descripcion <span className="text-white/35">(opcional)</span></span>
        <textarea
          name="summary"
          rows={2}
          maxLength={5000}
          placeholder="Breve descripcion del proyecto"
          className="w-full resize-none rounded-2xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs text-white/65">Estado inicial</span>
        <select
          name="status"
          defaultValue="draft"
          className="w-full rounded-2xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
        >
          <option value="draft">Borrador</option>
          <option value="active">Activo</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl border border-[#7B61FF]/40 bg-[#7B61FF]/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-[#7B61FF]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creando..." : "Crear proyecto"}
      </button>
    </form>
  );
}
