import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { identity } from "@/lib/portfolio/content";

// NOTA PARA EL TITULAR: este texto refleja el uso actual de cookies (sesión del
// portal + embed de Cal.com al agendar). Si más adelante añades analítica o
// píxeles publicitarios, deberás incorporar un banner de consentimiento de
// cookies y actualizar esta página.

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies utiliza la web de Xync y para qué.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de cookies" updated="18 de junio de 2026">
      <LegalSection title="1. Qué son las cookies">
        <p>
          Una cookie es un pequeño archivo que un sitio web guarda en tu navegador para recordar
          información sobre tu visita. Algunas son imprescindibles para que el sitio funcione y otras
          requieren tu consentimiento.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies que utiliza este sitio">
        <p>
          <strong>Cookies técnicas necesarias.</strong> Se usan para mantener la sesión iniciada en
          el portal de clientes (zonas <code>/cuenta</code> y <code>/admin</code>) y para la
          seguridad de los formularios. Sin ellas, esas funciones no operan. Están exentas de
          consentimiento.
        </p>
        <p>
          <strong>Cookies de terceros (Cal.com).</strong> Solo si decides agendar una llamada, se
          carga el módulo de reservas de Cal.com, que puede instalar cookies propias para gestionar
          la cita. Mientras no interactúas con ese botón, no se cargan.
        </p>
        <p>
          Actualmente este sitio <strong>no utiliza cookies de analítica ni de publicidad</strong>.
        </p>
      </LegalSection>

      <LegalSection title="3. Cómo gestionar las cookies">
        <p>
          Puedes bloquear o eliminar las cookies desde la configuración de tu navegador (Chrome,
          Firefox, Safari o Edge). Ten en cuenta que desactivar las cookies técnicas puede impedir el
          acceso al portal de clientes.
        </p>
      </LegalSection>

      <LegalSection title="4. Contacto">
        <p>
          Si tienes dudas sobre el uso de cookies, escríbenos a{" "}
          <a href={`mailto:${identity.email}`}>{identity.email}</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
