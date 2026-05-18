"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { AppMessage } from "@/lib/data/messages";

interface MessageThreadProps {
  projectId: string;
  messages: AppMessage[];
  currentUserRole: "user" | "admin";
  currentUserName: string;
  otherPartyName: string;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MessageThread({ projectId, messages, currentUserRole, currentUserName, otherPartyName }: MessageThreadProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo enviar el mensaje.");
        setIsSending(false);
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      setErrorMessage("Error de conexion. Intentalo de nuevo.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="space-y-4">
      <h3 className="font-display text-xl text-white">Mensajes</h3>

      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4"
      >
        {messages.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-white/40">
            Aun no hay mensajes. Inicia la conversacion.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.senderRole === currentUserRole;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] space-y-1 rounded-2xl px-4 py-3 ${
                      isOwn
                        ? "border border-[#8f7aff]/40 bg-[#7B61FF]/20"
                        : "border border-white/12 bg-white/5"
                    }`}
                  >
                    <p className="text-xs text-white/45">
                      {isOwn ? currentUserName : otherPartyName} · {formatTime(msg.createdAt)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-white/90">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">
          {errorMessage}
        </p>
      )}

      <form onSubmit={handleSend} className="flex gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          maxLength={4000}
          placeholder="Escribe un mensaje..."
          className="flex-1 resize-none rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          disabled={isSending || !content.trim()}
          className="self-end rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6B51EF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}
