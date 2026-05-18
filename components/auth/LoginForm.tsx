"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";
import { resolveAuthRedirectPath, sanitizeCallbackUrl } from "@/lib/auth/callback-url";

interface LoginFormProps {
  callbackUrl: string;
  googleEnabled: boolean;
  initialError?: string;
  registered?: boolean;
}

function mapSignInError(error?: string | null) {
  if (!error) {
    return "No se pudo iniciar sesion.";
  }

  if (error === "CredentialsSignin") {
    return "Email o contrasena incorrectos.";
  }

  if (error === "OAuthAccountNotLinked") {
    return "Este email ya existe con otro metodo de acceso.";
  }

  return "No se pudo iniciar sesion.";
}

export default function LoginForm({
  callbackUrl,
  googleEnabled,
  initialError,
  registered = false,
}: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl, "/");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setErrorMessage("Completa email y contrasena.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: safeCallbackUrl,
      redirect: false,
    });

    if (result?.ok) {
      router.push(resolveAuthRedirectPath(result?.url, safeCallbackUrl));
      router.refresh();
      return;
    }

    setErrorMessage(mapSignInError(result?.error));
    setIsSubmitting(false);
  }

  async function handleGoogleLogin() {
    setErrorMessage(null);
    setIsSubmitting(true);
    await signIn("google", { callbackUrl: safeCallbackUrl });
  }

  return (
    <div className="vx-glass-card rounded-3xl border border-white/15 bg-black/65 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">Acceso privado</p>
        <h1 className="font-display text-3xl text-white sm:text-4xl">Inicia sesion</h1>
        <p className="text-sm text-white/70">
          Entra a tu area personal para revisar proyectos, avances y ajustar tu perfil.
        </p>
      </div>

      {registered && (
        <p className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          Cuenta creada correctamente. Ya puedes acceder.
        </p>
      )}

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
            autoComplete="current-password"
            required
            minLength={8}
            className="w-full rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]"
            placeholder="Minimo 8 caracteres"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl border border-[#8f7aff] bg-[#7B61FF] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6B51EF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Accediendo..." : "Entrar"}
        </button>
      </form>

      {googleEnabled && (
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="mt-4 w-full rounded-2xl border border-white/30 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continuar con Google
        </button>
      )}

      <p className="mt-8 text-sm text-white/65">
        Aun no tienes cuenta?{" "}
        <Link href="/auth/register" className="font-medium text-white underline decoration-white/40 underline-offset-4">
          Registrate
        </Link>
      </p>
    </div>
  );
}
