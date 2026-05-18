"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteProjectButtonProps {
  projectId: string;
}

export default function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este proyecto? Esta accion no se puede deshacer.")) {
      return;
    }

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
        return;
      }

      router.push("/admin/proyectos");
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion. Intentalo de nuevo.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isDeleting}
        onClick={handleDelete}
        className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Eliminando..." : "Eliminar proyecto"}
      </button>
      {errorMessage && (
        <p className="text-xs text-red-300">{errorMessage}</p>
      )}
    </div>
  );
}
