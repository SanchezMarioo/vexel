"use client";

import { useState, useTransition } from "react";
import { updateLeadNotesAction } from "@/app/admin/actions";

interface LeadNotesEditorProps {
  leadId: string;
  initialNotes: string | null;
}

export function LeadNotesEditor({ leadId, initialNotes }: LeadNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [lastSavedNotes, setLastSavedNotes] = useState(initialNotes || "");
  const [isPending, startTransition] = useTransition();
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = notes !== lastSavedNotes;

  const handleSave = () => {
    if (!hasChanges && !error) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await updateLeadNotesAction(leadId, notes);
        if (res.ok) {
          setLastSavedNotes(notes);
          const time = new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });
          setSavedTime(`Guardado a las ${time}`);
        } else {
          setError("No se pudo guardar la nota.");
        }
      } catch {
        setError("Error de red al guardar.");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="lead-notes-input"
          className="text-xs font-semibold uppercase tracking-wider pf-mono text-white/70"
        >
          Notas internas del lead
        </label>
        <span className="text-[11px] pf-mono text-white/40 hidden sm:inline-block">
          Cmd + Enter para guardar
        </span>
      </div>

      <div className="relative">
        <textarea
          id="lead-notes-input"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          rows={4}
          placeholder="Añade apuntes sobre la llamada, presupuesto acordado, requisitos clave..."
          className="w-full bg-[#0a0a0a] hover:bg-[#0e0e0e] focus:bg-[#0c0c0c] border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/40 rounded-lg p-3 text-sm text-white placeholder-white/25 transition-colors resize-y min-h-[90px] outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="text-xs pf-mono">
          {isPending ? (
            <span className="text-amber-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Guardando nota...
            </span>
          ) : error ? (
            <span className="text-rose-400">{error}</span>
          ) : savedTime ? (
            <span className="text-emerald-400/90">{savedTime}</span>
          ) : (
            <span className="text-white/30">Sin cambios pendientes</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className={`px-3 py-1.5 rounded-md text-xs font-medium pf-mono transition-all duration-150 ${
            hasChanges && !isPending
              ? "bg-white text-black hover:bg-white/90 shadow-sm cursor-pointer"
              : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
          }`}
        >
          {isPending ? "Guardando..." : "Guardar nota"}
        </button>
      </div>
    </div>
  );
}
