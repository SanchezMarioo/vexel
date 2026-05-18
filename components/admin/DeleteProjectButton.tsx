"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteProjectButtonProps {
  projectId: string;
}

export default function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo eliminar el proyecto.");
        setIsDeleting(false);
        setConfirming(false);
        return;
      }

      router.push("/admin/proyectos");
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion. Intentalo de nuevo.");
      setIsDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-2">
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">¿Eliminar proyecto?</span>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="rounded-2xl border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Eliminando..." : "Confirmar"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setConfirming(false)}
            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/25"
        >
          Eliminar proyecto
        </button>
      )}
      {errorMessage && (
        <p className="text-xs text-red-300">{errorMessage}</p>
      )}
    </div>
  );
}
