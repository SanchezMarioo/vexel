import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { identity, legalEntity } from "@/lib/portfolio/content";

// Los datos del responsable vienen de `legalEntity` (fuente única). Revisa el
// texto con un asesor. Estructura conforme al RGPD (UE 2016/679) y la LOPDGDD
// 3/2018. Ajusta la lista de "encargados del tratamiento" a los proveedores que
// uses realmente (alojamiento, hoja de cálculo, base de datos, agenda).

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo trata Xync los datos personales recogidos a través de la web y del formulario de contacto, conforme al RGPD.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de privacidad" updated="18 de junio de 2026">
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos es {legalEntity.legalName} («{identity.name}
          »), con domicilio en {legalEntity.locality}, {legalEntity.region} (
          {legalEntity.countryName}) y correo electrónico de contacto{" "}
          <a href={`mailto:${identity.email}`}>{identity.email}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos recogemos y con qué finalidad">
        <p>
          A través del <strong>formulario de contacto</strong> recogemos tu nombre, tu correo
          electrónico y el mensaje que nos escribes, con la única finalidad de responder a tu
          solicitud y, en su caso, preparar una propuesta de servicios.
        </p>
        <p>
          Si eres cliente y usas el <strong>portal de clientes</strong>, tratamos los datos de tu
          cuenta y de tus proyectos con la finalidad de gestionar el servicio contratado.
        </p>
      </LegalSection>

      <LegalSection title="3. Legitimación">
        <p>
          La base legal para tratar los datos del formulario es tu <strong>consentimiento</strong>,
          que otorgas al marcar la casilla de aceptación antes de enviarlo. En el caso de clientes,
          la base es la ejecución de un contrato.
        </p>
      </LegalSection>

      <LegalSection title="4. Conservación">
        <p>
          Conservamos los datos del formulario el tiempo necesario para atender tu solicitud y, si no
          deriva en una relación contractual, durante un plazo razonable tras el último contacto,
          salvo que solicites su supresión antes. Los datos de clientes se conservan mientras dure la
          relación y durante los plazos legales de prescripción.
        </p>
      </LegalSection>

      <LegalSection title="5. Destinatarios y encargados del tratamiento">
        <p>
          No vendemos ni cedemos tus datos a terceros. Para prestar el servicio nos apoyamos en
          proveedores que actúan como encargados del tratamiento (alojamiento web, gestión de
          mensajes del formulario, base de datos y agenda de llamadas), entre ellos
          [PROVEEDORES: p. ej. Vercel, Google, Supabase, Cal.com]. Algunos pueden estar ubicados
          fuera del Espacio Económico Europeo, en cuyo caso se aplican las garantías previstas por el
          RGPD.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del
          tratamiento y portabilidad escribiendo a{" "}
          <a href={`mailto:${identity.email}`}>{identity.email}</a>, indicando el derecho que deseas
          ejercer. También tienes derecho a presentar una reclamación ante la Agencia Española de
          Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noreferrer noopener">
            aepd.es
          </a>
          ) si consideras que el tratamiento no se ajusta a la normativa.
        </p>
      </LegalSection>

      <LegalSection title="7. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas para proteger tus datos, incluida la conexión
          cifrada (HTTPS) y el control de acceso a los sistemas donde se almacenan.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
