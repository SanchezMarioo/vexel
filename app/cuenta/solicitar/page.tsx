import type { Metadata } from "next";
import RequestForm from "@/components/account/RequestForm";
import { requireSessionUser } from "@/lib/auth/service";

export const metadata: Metadata = {
  title: "Nueva solicitud",
};

export default async function SolicitarPage() {
  await requireSessionUser("/cuenta/solicitar");

  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Nueva solicitud</p>
        <h2 className="mt-2 font-display text-3xl text-white">Cuéntanos tu proyecto</h2>
        <p className="mt-2 text-sm text-white/65">
          Rellena el formulario y nuestro equipo revisara tu solicitud. Te contactaremos en menos de 48 horas.
        </p>
      </header>

      <RequestForm />
    </article>
  );
}
