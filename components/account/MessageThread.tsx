"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import type { AppMessage } from "@/lib/data/messages";

interface MessageThreadProps {
  projectId: string;
  messages: AppMessage[];
  currentUserRole: "user" | "admin";
  currentUserName: string;
  otherPartyName: string;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
      .filter((f) => ALLOWED_TYPES.has(f.type) && f.size <= MAX_FILE_SIZE && f.size > 0)
      .slice(0, 3);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]!);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed && selectedFiles.length === 0) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      let imageUrls: string[] = [];

      if (selectedFiles.length > 0) {
        const fd = new FormData();
        selectedFiles.forEach((file) => fd.append("images", file));

        const uploadRes = await fetch(`/api/projects/${projectId}/upload`, {
          method: "POST",
          body: fd,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setErrorMessage(uploadData.message ?? "No se pudo subir la imagen.");
          setIsSending(false);
          return;
        }

        imageUrls = uploadData.imageUrls as string[];
      }

      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, imageUrls }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ?? "No se pudo enviar el mensaje.");
        setIsSending(false);
        return;
      }

      setContent("");
      setSelectedFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
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
        className="h-80 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb:hover]:bg-white/40"
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
                    {msg.content && (
                      <p className="whitespace-pre-wrap text-sm text-white/90">{msg.content}</p>
                    )}
                    {msg.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.imageUrls.map((url, i) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`Imagen adjunta ${i + 1}`}
                              className="h-24 w-24 rounded-xl border border-white/10 object-cover transition hover:opacity-80"
                            />
                          </a>
                        ))}
                      </div>
                    )}
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

      <form onSubmit={handleSend} className="rounded-2xl border border-white/20 bg-black/45 focus-within:ring-2 focus-within:ring-[#7B61FF]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Previews de imágenes seleccionadas */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 pt-3 pb-2">
            {previews.map((src, i) => (
              <div key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="h-14 w-14 rounded-xl border border-white/15 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black/80 text-xs text-white/70 hover:bg-red-900/80"
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          maxLength={4000}
          placeholder="Escribe un mensaje..."
          className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-white placeholder:text-white/35 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />

        {/* Barra inferior */}
        <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || selectedFiles.length >= 3}
            title="Adjuntar imagen (máx. 3)"
            className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs text-white/45 transition hover:bg-white/8 hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
            <span>Imagen{selectedFiles.length > 0 ? ` (${selectedFiles.length}/3)` : ""}</span>
          </button>

          <button
            type="submit"
            disabled={isSending || (!content.trim() && selectedFiles.length === 0)}
            className="rounded-xl border border-[#8f7aff]/70 bg-[#7B61FF] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#6B51EF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </section>
  );
}
