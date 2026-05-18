"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";
import { resolveAuthRedirectPath, sanitizeCallbackUrl } from "@/lib/auth/callback-url";

interface RegisterFormProps {
  callbackUrl: string;
  googleEnabled: boolean;
}

export default function RegisterForm({ callbackUrl, googleEnabled }: RegisterFormProps) {
  const router = useRouter();
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl, "/");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setErrorMessage("Las contrasenas no coinciden.");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setErrorMessage(payload?.message ?? "No se pudo crear tu cuenta.");
      setIsSubmitting(false);
      return;
    }

    const loginResult = await signIn("credentials", {
      email,
      password,
      callbackUrl: safeCallbackUrl,
      redirect: false,
    });

    if (loginResult?.ok) {
      router.push(resolveAuthRedirectPath(loginResult?.url, safeCallbackUrl));
      router.refresh();
      return;
    }

    router.push(`/auth/login?registered=1&callbackUrl=${encodeURIComponent(safeCallbackUrl)}`);
    router.refresh();
  }

  async function handleGoogleRegister() {
    setErrorMessage(null);
    setIsSubmitting(true);
    await signIn("google", { callbackUrl: safeCallbackUrl });
  }

  return (
    <div className="vx-glass-card rounded-3xl border border-white/15 bg-black/65 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">Nueva cuenta</p>
        <h1 className="font-display text-3xl text-white sm:text-4xl">Crea tu acceso</h1>
        <p className="text-sm text-white/70">
          Abre tu area personal para gestionar tus proyectos de Vexel desde un solo lugar.
        </p>
      </div>

      {errorMessage && (
        <p
          className="mt-6 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
        <label className="block space-y-2">
          <span className="text-sm text-white/75">Nombre</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            placeholder="Tu nombre"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/75">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            placeholder="tu@email.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/75">Contrasena</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            placeholder="Minimo 8 caracteres"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-white/75">Repetir contrasena</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            placeholder="Repite tu contrasena"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6B51EF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      {googleEnabled && (
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isSubmitting}
          className="mt-4 w-full rounded-2xl border border-white/30 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continuar con Google
        </button>
      )}

      <p className="mt-8 text-sm text-white/65">
        Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-medium text-white underline decoration-white/40 underline-offset-4">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
