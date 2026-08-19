"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLeadAction } from "@/app/admin/actions";

interface DeleteLeadButtonProps {
  leadId: string;
  leadName?: string;
  redirectUrl?: string;
  onDeleted?: (leadId: string) => void;
  variant?: "icon" | "button" | "menu";
}

export function DeleteLeadButton({
  leadId,
  leadName,
  redirectUrl,
  onDeleted,
  variant = "button",
}: DeleteLeadButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLeadAction(leadId);
      if (result.ok) {
        if (onDeleted) {
          onDeleted(leadId);
        }
        if (redirectUrl) {
          router.push(redirectUrl);
          router.refresh();
        }
      } else {
        alert("Error al eliminar el lead: " + (result.error || "Inténtalo de nuevo."));
        setIsConfirming(false);
      }
    });
  };

  if (isConfirming) {
    return (
      <div className="inline-flex items-center gap-1.5 p-1 bg-red-950/40 border border-red-500/30 rounded-lg text-xs pf-mono animate-in fade-in zoom-in-95 duration-150">
        <span className="text-[11px] text-red-200 px-1 hidden sm:inline">¿Eliminar?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {isPending ? "Borrando..." : "Sí, borrar"}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-[11px] transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        title={`Eliminar lead ${leadName || ""}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs pf-mono text-white/50 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all cursor-pointer"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      <span>Eliminar lead</span>
    </button>
  );
}
