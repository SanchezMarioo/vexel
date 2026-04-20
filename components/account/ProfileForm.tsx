"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export default function ProfileForm({ initialName, email }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setErrorMessage(payload?.message ?? "No se pudo guardar el perfil.");
      setIsSaving(false);
      return;
    }

    setSuccessMessage("Perfil actualizado correctamente.");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <p className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <label className="block space-y-2">
        <span className="text-sm text-white/75">Email (solo lectura)</span>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white/65"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-white/75">Nombre</span>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={80}
          required
          className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
          placeholder="Tu nombre"
        />
      </label>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6B51EF] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}