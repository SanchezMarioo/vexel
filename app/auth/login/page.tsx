import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";

export const metadata: Metadata = {
  title: "Iniciar sesion",
  description: "Acceso privado a tu area personal de proyectos en Vexel.",
};

type LoginPageSearchParams = {
  callbackUrl?: string;
  registered?: string;
  error?: string;
};

interface LoginPageProps {
  searchParams: Promise<LoginPageSearchParams>;
}

function mapInitialError(errorCode?: string) {
  if (!errorCode) {
    return undefined;
  }

  if (errorCode === "OAuthAccountNotLinked") {
    return "Este email ya esta vinculado a otro metodo de acceso.";
  }

  return "No se pudo completar el acceso.";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl, "/cuenta");
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <LoginForm
      callbackUrl={callbackUrl}
      googleEnabled={googleEnabled}
      registered={params.registered === "1"}
      initialError={mapInitialError(params.error)}
    />
  );
}