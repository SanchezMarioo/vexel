import { faqs, identity, isRealUrl, legalEntity } from "@/lib/portfolio/content";
import { siteUrl } from "@/lib/site-url";

/**
 * Datos estructurados de la ENTIDAD Xync, como un grafo conectado:
 *   Person ──worksFor──▶ ProfessionalService ◀──publisher── WebSite
 * con @id internos para que Google y los motores de IA consoliden "Xync" como
 * una sola entidad local de Salamanca.
 *
 * - `sameAs` se deriva de identity.socials y se filtra con isRealUrl, así nunca
 *   se emiten URLs placeholder (LinkedIn/GitHub) hasta que sean reales.
 * - FAQPage: aunque Google retiró el rich result, el marcado sigue dando valor
 *   semántico a los motores de IA (ChatGPT/Perplexity/Gemini), que consumen los
 *   pares pregunta-respuesta como pasajes citables. Se deriva de `faqs` para no
 *   duplicar el copy (fuente única en content.ts). Sin HowTo (retirado sep-2023).
 *
 * Se renderiza una sola vez en app/layout.tsx → válido en todo el sitio.
 */
export default function StructuredData() {
  const sameAs = identity.socials.map((s) => s.href).filter(isRealUrl);

  // NAP único compartido por Person y ProfessionalService (postalCode opcional).
  const postalAddress = {
    "@type": "PostalAddress",
    streetAddress: legalEntity.street,
    addressLocality: legalEntity.locality,
    addressRegion: legalEntity.region,
    ...(legalEntity.postalCode ? { postalCode: legalEntity.postalCode } : {}),
    addressCountry: legalEntity.countryCode,
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: legalEntity.legalName,
        alternateName: identity.name,
        jobTitle: "Desarrollador web freelance",
        description:
          "Desarrollador web freelance en Salamanca. Diseño y desarrollo webs, tiendas online y productos digitales rápidos y orientados a conversión.",
        url: siteUrl,
        email: `mailto:${identity.email}`,
        image: `${siteUrl}/opengraph-image`,
        knowsAbout: [
          "Desarrollo web",
          "Next.js",
          "React",
          "SEO técnico",
          "Ecommerce",
          "Diseño web de conversión",
        ],
        knowsLanguage: ["es"],
        worksFor: { "@id": `${siteUrl}/#business` },
        address: postalAddress,
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        // Tipo dual: ProfessionalService (estudio freelance sin local público)
        // + LocalBusiness para máxima cobertura de señales locales en IA/Google.
        // ProfessionalService es subtipo de LocalBusiness, así que no se pierde
        // ninguna propiedad heredada (address, geo, areaServed, priceRange).
        "@type": ["LocalBusiness", "ProfessionalService"],
        "@id": `${siteUrl}/#business`,
        name: identity.name,
        legalName: legalEntity.legalName,
        brand: identity.name,
        alternateName: "Xync — Desarrollo web freelance",
        description:
          "Estudio freelance de diseño y desarrollo web en Salamanca: landing pages, tiendas online y productos digitales con precio y plazo cerrados.",
        url: siteUrl,
        email: `mailto:${identity.email}`,
        image: `${siteUrl}/opengraph-image`,
        logo: `${siteUrl}/icon`,
        founder: { "@id": `${siteUrl}/#person` },
        priceRange: "€€",
        serviceType: [
          "Diseño web",
          "Desarrollo web",
          "Tiendas online / ecommerce",
          "Landing pages de conversión",
        ],
        knowsAbout: ["Next.js", "React", "SEO técnico", "Ecommerce", "Diseño de conversión"],
        inLanguage: "es",
        address: postalAddress,
        // Centroide de Salamanca capital (negocio de área de servicio, sin
        // dirección de calle pública). Cámbialo si tu base es otro municipio.
        geo: { "@type": "GeoCoordinates", latitude: 40.9701, longitude: -5.6635 },
        areaServed: [
          { "@type": "City", name: "Salamanca" },
          { "@type": "AdministrativeArea", name: "Castilla y León" },
          { "@type": "Country", name: "España" },
        ],
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: identity.name,
        inLanguage: "es",
        publisher: { "@id": `${siteUrl}/#business` },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#business` },
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escapa el carácter "menor que" a su equivalente unicode para neutralizar
      // cualquier intento de XSS si en el futuro el contenido de content.ts
      // incluyera HTML (recomendación oficial de Next.js para JSON-LD, ya que
      // JSON.stringify no escapa etiquetas por sí mismo).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
