import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { identity, legalEntity } from "@/lib/portfolio/content";

// Los datos del titular (nombre, NIF, domicilio) viven en `legalEntity`
// (lib/portfolio/content.ts) como fuente única. Revisa este texto con un asesor
// antes de considerarlo definitivo. La estructura cumple el art. 10 de la LSSI-CE.

export const metadata: Metadata = {
  title: "Aviso legal",
  description:
    "Aviso legal y condiciones de uso de la web de Xync, estudio de desarrollo web freelance en Salamanca.",
  alternates: { canonical: "/aviso-legal" },
};

export default function AvisoLegalPage() {
  return (
    <LegalLayout title="Aviso legal" updated="18 de junio de 2026">
      <LegalSection title="1. Datos del titular">
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
          informa de que el titular de este sitio web es:
        </p>
        <ul>
          <li>
            Titular: {legalEntity.legalName}, que opera bajo la marca «
            {identity.name}».
          </li>
          <li>NIF: {legalEntity.nif}.</li>
          <li>
            Domicilio: {legalEntity.street}
            {legalEntity.postalCode ? `, ${legalEntity.postalCode}` : ""},{" "}
            {legalEntity.locality}, {legalEntity.region} (
            {legalEntity.countryName}).
          </li>
          <li>
            Correo electrónico:{" "}
            <a href={`mailto:${identity.email}`}>{identity.email}</a>.
          </li>
          <li>
            Actividad: diseño y desarrollo de webs, tiendas online y productos
            digitales.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Objeto">
        <p>
          El presente aviso legal regula el uso del sitio web{" "}
          <strong>xync.es</strong> y de sus subdominios. La navegación por el
          sitio atribuye la condición de usuario e implica la aceptación plena
          de todas las cláusulas de este aviso legal.
        </p>
      </LegalSection>

      <LegalSection title="3. Condiciones de uso">
        <p>
          El usuario se compromete a hacer un uso adecuado de los contenidos y
          servicios del sitio y a no emplearlos para incurrir en actividades
          ilícitas, contrarias a la buena fe o al orden público, ni para causar
          daños en los sistemas físicos y lógicos del titular o de terceros.
        </p>
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual e industrial">
        <p>
          Los textos, el diseño, el código fuente, los logotipos y demás
          elementos de este sitio son titularidad del titular o de terceros que
          han autorizado su uso, y están protegidos por la normativa de
          propiedad intelectual e industrial. Queda prohibida su reproducción,
          distribución o transformación sin autorización expresa.
        </p>
      </LegalSection>

      <LegalSection title="5. Responsabilidad">
        <p>
          El titular no se hace responsable de los daños derivados del uso
          indebido del sitio ni de las interrupciones, errores u omisiones que
          pudieran existir. Se reserva el derecho a modificar, suspender o
          retirar el acceso al sitio o a cualquiera de sus contenidos sin previo
          aviso.
        </p>
      </LegalSection>

      <LegalSection title="6. Enlaces">
        <p>
          El sitio puede contener enlaces a páginas de terceros. El titular no
          asume responsabilidad alguna sobre los contenidos o servicios de esos
          sitios externos.
        </p>
      </LegalSection>

      <LegalSection title="7. Legislación aplicable y jurisdicción">
        <p>
          Este aviso legal se rige por la legislación española. Para la
          resolución de cualquier controversia, las partes se someten a los
          juzgados y tribunales del domicilio del usuario cuando este tenga la
          condición de consumidor.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
