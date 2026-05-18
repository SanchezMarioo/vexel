"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface AdminRequestActionsProps {
  requestId: string;
}

export default function AdminRequestActions({ requestId }: AdminRequestActionsProps) {
  const router = useRouter();
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAction(action: "accept" | "reject") {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: adminNote.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo procesar la solicitud.");
        setIsProcessing(false);
        return;
      }

      if (action === "accept" && data.project?.id) {
        router.push(`/admin/proyectos/${data.project.id}`);
      } else {
        router.push("/admin/solicitudes");
      }
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion. Intentalo de nuevo.");
      setIsProcessing(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/12 bg-black/25 p-5">
      <h3 className="font-display text-xl text-white">Revisar solicitud</h3>

      {errorMessage && (
        <p className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">
          {errorMessage}
        </p>
      )}

      <label className="block space-y-2">
        <span className="text-sm text-white/75">
          Nota para el cliente <span className="text-white/40">(opcional)</span>
        </span>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Escribe un mensaje para el cliente..."
          className="w-full resize-none rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleAction("accept")}
          className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? "Procesando..." : "Aceptar solicitud"}
        </button>
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleAction("reject")}
          className="rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Rechazar
        </button>
      </div>
    </section>
  );
}
