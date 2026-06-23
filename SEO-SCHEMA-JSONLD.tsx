/* ───────────────────────────────────────────────────────────────────────────
 * Xync — JSON-LD estructurado (FASE 2 · Schema local)
 * Validado con JSON.parse + diseñado contra schema.org. Listo para pegar.
 *
 * QUÉ HACE: declara la ENTIDAD Xync como un grafo conectado
 *   Person  ──worksFor──▶  ProfessionalService  ◀──publisher──  WebSite
 * con @id internos para que Google y los motores de IA consoliden "Xync"
 * como una sola entidad local de Salamanca.
 *
 * NO incluye FAQPage (rich result retirado por Google el 7-may-2026) ni HowTo
 * (retirado sep-2023), según lo solicitado.
 *
 * ───────────────────────── ANTES DE USAR ──────────────────────────────────
 * 1. PREREQUISITO (P0): NEXT_PUBLIC_SITE_URL en Vercel = https://www.xync.es
 *    (hoy en producción vale http://localhost:3000 → rompe url/image de TODO
 *    el schema). El guard de abajo te protege aunque la variable esté mal.
 * 2. Sustituye los 2 marcadores REAL_LINKEDIN / REAL_GITHUB por tus URLs reales.
 *    Si no tienes LinkedIn/GitHub público todavía, BORRA esa línea del array
 *    sameAs (no dejes una URL inventada: Google penaliza sameAs rotos).
 * 3. (Recomendado E-E-A-T) Si quieres, añade tu nombre real como persona:
 *    name: "Tu Nombre", y deja "Xync" como alternateName / la marca del negocio.
 * 4. geo: 40.9701, -5.6635 = centroide de Salamanca capital. Cámbialo si tu
 *    base real es otro municipio de la provincia.
 *
 * ───────────────────────── DÓNDE PEGAR ────────────────────────────────────
 * Opción A (recomendada): en app/layout.tsx, dentro de <body>, renderiza
 *   <XyncJsonLd /> una sola vez (entidad válida en todo el sitio).
 * Y ELIMINA los bloques personJsonLd + serviceJsonLd de app/page.tsx (líneas
 * 38-75) para no duplicar la entidad. Mantén BreadcrumbList en subpáginas.
 * ─────────────────────────────────────────────────────────────────────────── */

// Guard anti-localhost: aunque la env var esté mal en producción, nunca
// emitimos URLs de localhost en el schema.
const RAW = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  RAW && RAW.startsWith("https://") ? RAW : "https://www.xync.es";

const xyncGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Xync", // ← (opcional) pon aquí tu nombre real para reforzar E-E-A-T
      jobTitle: "Desarrollador web freelance",
      description:
        "Desarrollador web freelance en Salamanca. Diseño y desarrollo webs, tiendas online y productos digitales rápidos y orientados a conversión.",
      url: siteUrl,
      email: "mailto:xyncdev@gmail.com",
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
      address: {
        "@type": "PostalAddress",
        addressLocality: "Salamanca",
        addressRegion: "Castilla y León",
        addressCountry: "ES",
      },
      sameAs: [
        "https://discord.gg/aENy8Sb4rS",
        "https://www.linkedin.com/in/REAL_LINKEDIN", // ← sustituir o borrar
        "https://github.com/REAL_GITHUB", // ← sustituir o borrar
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#business`,
      name: "Xync",
      alternateName: "Xync — Desarrollo web freelance",
      description:
        "Estudio freelance de diseño y desarrollo web en Salamanca: landing pages, tiendas online y productos digitales con precio y plazo cerrados.",
      url: siteUrl,
      email: "mailto:xyncdev@gmail.com",
      image: `${siteUrl}/opengraph-image`,
      logo: `${siteUrl}/icon`,
      founder: { "@id": `${siteUrl}/#person` },
      priceRange: "€€", // o un rango explícito: "1.200€–2.400€"
      serviceType: [
        "Diseño web",
        "Desarrollo web",
        "Tiendas online / ecommerce",
        "Landing pages de conversión",
      ],
      knowsAbout: ["Next.js", "React", "SEO técnico", "Ecommerce", "Diseño de conversión"],
      inLanguage: "es",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Salamanca",
        addressRegion: "Castilla y León",
        addressCountry: "ES",
      },
      // Centroide de Salamanca capital (negocio de área de servicio, sin
      // dirección de calle pública). Cámbialo si tu base es otro municipio.
      geo: { "@type": "GeoCoordinates", latitude: 40.9701, longitude: -5.6635 },
      areaServed: [
        { "@type": "City", name: "Salamanca" },
        { "@type": "AdministrativeArea", name: "Castilla y León" },
        { "@type": "Country", name: "España" },
      ],
      sameAs: [
        "https://discord.gg/aENy8Sb4rS",
        "https://www.tiktok.com/@xyncdev"
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Xync",
      inLanguage: "es",
      publisher: { "@id": `${siteUrl}/#business` },
    },
  ],
};

/** Renderiza el grafo JSON-LD de Xync. Úsalo una vez en app/layout.tsx. */
export default function XyncJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(xyncGraph) }}
    />
  );
}

/* ─────────────────── POR QUÉ ProfessionalService y no LocalBusiness ─────────
 * Un freelance que trabaja desde casa NO es un comercio con escaparate.
 * ProfessionalService es subtipo de LocalBusiness → te da TODAS las señales
 * locales (address, geo, areaServed, priceRange) sin obligarte a publicar una
 * dirección de calle ni arriesgar una suspensión de Google Business Profile por
 * usar un domicilio particular como si fuera una tienda.
 * Si algún día abres oficina física con atención al público, sube a un subtipo
 * con streetAddress + openingHoursSpecification.
 *
 * areaServed explícito (Salamanca → Castilla y León → España) cubre tu mercado
 * primario y secundario. Para LATAM NO añadas países: diluiría la señal local
 * y el contenido es es-ES. El trabajo remoto en LATAM se comunica en el copy,
 * no en el schema local.
 * ─────────────────────────────────────────────────────────────────────────── */
