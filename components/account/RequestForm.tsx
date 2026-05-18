"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  landing_page: "Landing page",
  local_campaign: "Campana local de temporada",
  ecommerce: "Tienda online",
  other: "Otro",
};

export default function RequestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      projectType: String(formData.get("projectType") ?? ""),
      description: String(formData.get("description") ?? "").trim(),
      budget: String(formData.get("budget") ?? "").trim() || undefined,
      referenceUrl: String(formData.get("referenceUrl") ?? "").trim() || undefined,
    };

    try {
      const res = await fetch("/api/account/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo enviar la solicitud.");
        setIsSubmitting(false);
        return;
      }

      router.push("/cuenta/solicitudes");
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion. Intentalo de nuevo.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errorMessage && (
        <p
          className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <label className="block space-y-2">
        <span className="text-sm text-white/75">Titulo del proyecto</span>
        <input
          type="text"
          name="title"
          required
          minLength={3}
          maxLength={120}
          className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          placeholder="Ej: Landing page para mi restaurante"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-white/75">Tipo de proyecto</span>
        <select
          name="projectType"
          required
          defaultValue="landing_page"
          className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
        >
          {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#0c0c0e] text-white">
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-white/75">Descripcion del proyecto</span>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="w-full resize-none rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          placeholder="Cuentanos que necesitas, para que es tu negocio, que quieres transmitir..."
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-white/75">
          Presupuesto aproximado <span className="text-white/40">(opcional)</span>
        </span>
        <input
          type="text"
          name="budget"
          maxLength={100}
          className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          placeholder="Ej: 500 - 1000 €"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-white/75">
          URL de referencia <span className="text-white/40">(opcional)</span>
        </span>
        <input
          type="url"
          name="referenceUrl"
          maxLength={500}
          className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          placeholder="https://ejemplo.com"
        />
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6B51EF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Enviar solicitud"}
        </button>
        <a
          href="/cuenta/solicitudes"
          className="rounded-2xl border border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-white/75 transition hover:border-white/35 hover:text-white"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
