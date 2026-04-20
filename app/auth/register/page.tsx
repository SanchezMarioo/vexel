import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registro para acceder a tu area personal de proyectos en Vexel.",
};

type RegisterPageSearchParams = {
  callbackUrl?: string;
};

interface RegisterPageProps {
  searchParams: Promise<RegisterPageSearchParams>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl, "/cuenta");
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return <RegisterForm callbackUrl={callbackUrl} googleEnabled={googleEnabled} />;
}