import {
  identity,
  legalEntity,
  projects,
  processSteps,
  services as mainServices,
  getProjectBySlug,
} from "@/lib/portfolio/content";
import { faqs as localFaqs } from "@/lib/content/faqs";
import { getPosts } from "@/lib/blog/getPosts";
import { getPost } from "@/lib/blog/getPost";
import { getService } from "@/lib/services/getService";
import type { BlogBlock } from "@/lib/content/blog";
import { getReadingTime } from "@/lib/content/blog";
import { siteUrl } from "@/lib/site-url";

/**
 * Estima el número de tokens de un texto markdown (~4 caracteres por token).
 * Utilizado para la cabecera estándar HTTP `x-markdown-tokens`.
 */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function normalizePath(rawPath: string): string {
  const clean = rawPath.split("?")[0].split("#")[0];
  if (clean.length > 1 && clean.endsWith("/")) {
    return clean.slice(0, -1);
  }
  return clean || "/";
}

function renderBlock(block: BlogBlock): string {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? `\n## ${block.text}\n` : `\n### ${block.text}\n`;
    case "paragraph":
      return `\n${block.text}\n`;
    case "list":
      return (
        "\n" +
        block.items
          .map((item, i) =>
            block.style === "number" ? `${i + 1}. ${item}` : `- ${item}`
          )
          .join("\n") +
        "\n"
      );
    case "quote":
      return `\n> ${block.text}${block.source ? `\n> — *${block.source}*` : ""}\n`;
    case "evidence":
      return `\n> **Caso real**: [${block.projectName}](/proyectos/${block.projectSlug}) — ${block.text}\n`;
    case "code":
      return `\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`;
    case "image":
      return `\n![${block.alt || "Imagen"}](${block.src})${block.caption ? `\n*${block.caption}*` : ""}\n`;
    default:
      return "";
  }
}

function getHomeMarkdown(): string {
  return `# ${identity.name} · Desarrollo y diseño web en Salamanca

> Estudio freelance de desarrollo y diseño web en Salamanca. Creamos páginas web, tiendas online y productos digitales rápidos y orientados a conversión, con precio y plazo cerrados.

- **Titular / Fundador**: Alejandro Martín Herrero
- **Ubicación**: ${identity.location}
- **Área de servicio**: Salamanca, toda España y Latinoamérica (remoto)
- **Contacto**: [${identity.email}](mailto:${identity.email}) | ${siteUrl}
- **Disponibilidad**: ${identity.availability} (${identity.responseTime})
- **Tecnologías**: Next.js, React, Medusa.js, Tailwind CSS, TypeScript, PostgreSQL, Stripe, SEO técnico.

---

## Servicios

${mainServices
  .map(
    (s, i) => `### ${i + 1}. ${s.title}
${s.description}
- **Público objetivo**: ${s.audience}
- **Resultado esperado**: ${s.result}
`
  )
  .join("\n")}

---

## Proceso de trabajo

${processSteps
  .map(
    (p, i) => `### Paso ${i + 1}: ${p.title}
- **Qué hace el cliente**: ${p.you}
- **Qué hace Xync**: ${p.me}
- **Cuándo**: ${p.when}
`
  )
  .join("\n")}

---

## Proyectos y casos de estudio destacados

${projects
  .map(
    (p) => `### [${p.title}](${siteUrl}/proyectos/${p.slug})
- **Sector**: ${p.sector}
- **Problema de negocio**: ${p.problem}
- **Solución construida**: ${p.built}
- **Resultado**: ${p.result}
- **Stack**: ${p.stack.join(", ")}
${p.liveUrl ? `- **Enlace en vivo**: [${p.liveUrl}](${p.liveUrl})` : ""}
`
  )
  .join("\n")}

---

## Preguntas frecuentes

${localFaqs
  .map(
    (f) => `### ${f.question}
${f.answer}
`
  )
  .join("\n")}

---

## Contacto y contratación

- **Email**: ${identity.email}
- **Web principal**: ${siteUrl}
- **Formulario de inicio**: ${siteUrl}/empezar
`;
}

function getProjectsIndexMarkdown(): string {
  return `# Proyectos y casos de estudio · Xync

> Casos reales de webs y tiendas online construidas por Xync en Salamanca: ecommerce, restaurantes y productos digitales con resultados medibles.

${projects
  .map(
    (p) => `## [${p.title}](${siteUrl}/proyectos/${p.slug})

- **Sector**: ${p.sector}
- **El reto**: ${p.problem}
- **Qué construimos**: ${p.built}
- **Resultado**: ${p.result}
- **Tecnologías**: ${p.stack.join(", ")}
${p.liveUrl ? `- **Demo en vivo**: [${p.liveUrl}](${p.liveUrl})` : ""}
`
  )
  .join("\n")}

---

Para encargar un proyecto similar, escríbenos a [${identity.email}](mailto:${identity.email}) o visita [${siteUrl}/empezar](${siteUrl}/empezar).
`;
}

function getProjectDetailMarkdown(slug: string): string | null {
  const project = getProjectBySlug(slug);
  if (!project) return null;

  return `# ${project.title}

- **Sector**: ${project.sector}
- **Tecnologías utilizadas**: ${project.stack.join(", ")}
${project.liveUrl ? `- **Sitio web en vivo**: [${project.liveUrl}](${project.liveUrl})` : ""}

## El problema de negocio
${project.problem}

## Qué construimos
${project.built}

## Resultados obtenidos
${project.result}

---

- [Ver todos los proyectos](${siteUrl}/proyectos)
- [Pedir presupuesto a Xync](${siteUrl}/empezar)
`;
}

async function getBlogIndexMarkdown(): Promise<string> {
  const posts = await getPosts();

  return `# Blog de Xync · Desarrollo web, SEO y rendimiento

> Artículos prácticos sobre diseño web, velocidad de carga, SEO y conversión para negocios.

${
  posts.length > 0
    ? posts
        .map(
          (post) => `## [${post.title}](${siteUrl}/blog/${post.slug})

- **Publicado**: ${post.publishedAt}
- **Tiempo de lectura**: ${getReadingTime(post)}
- **Resumen**: ${post.excerpt}
`
        )
        .join("\n")
    : "No hay artículos publicados todavía."
}

---

Para más información, visita [${siteUrl}](${siteUrl}).
`;
}

async function getBlogPostMarkdown(slug: string): Promise<string | null> {
  const post = await getPost(slug);
  if (!post) return null;

  const renderedContent = post.content.map(renderBlock).join("\n");

  return `# ${post.title}

- **Fecha de publicación**: ${post.publishedAt}
- **Tiempo de lectura estimado**: ${getReadingTime(post)}
- **Resumen**: ${post.excerpt}

---

> ${post.intro}

${renderedContent}

---

${post.cta ? `### ${post.cta.title}\n${post.cta.text}\n\n[${post.cta.label}](${siteUrl}${post.cta.href})\n\n---\n` : ""}

[Volver al blog](${siteUrl}/blog) | [Web de Xync](${siteUrl})
`;
}

async function getServiceMarkdown(slug: string): Promise<string | null> {
  const service = await getService(slug);
  if (!service) return null;

  const content = service.content.map(renderBlock).join("\n");
  const faqs = service.faq
    .map((f) => `### ${f.question}\n${f.answer}\n`)
    .join("\n");

  return `# ${service.title}

> ${service.metaDescription}

${service.hero?.text ? `\n${service.hero.text}\n` : ""}

${content}

${faqs ? `\n## Preguntas frecuentes sobre este servicio\n\n${faqs}` : ""}

---

### ${service.cta.title}
${service.cta.text}

[${service.cta.label}](${siteUrl}${service.cta.href})
`;
}

function getLandingPagesMarkdown(): string {
  return `# Landing Pages para Negocios Locales que Convierten | Xync

> Diseñamos landing pages para negocios locales orientadas a captar más contactos y ventas. Estrategia, copy, diseño y desarrollo en 14 días.

## Características incluidas
- Estrategia de conversión y definición del objetivo principal.
- Copy orientado a ventas con estructura de alto impacto.
- Diseño visual con jerarquía clara para facilitar la toma de decisiones.
- Desarrollo responsive optimizado para SEO técnico y velocidad.
- Integración de llamada a la acción (CTA) y flujo de contacto sin fricción.

## Proceso y condiciones
- **Plazo**: 14 días laborables de principio a fin.
- **Precio**: Desde 1.200€ con presupuesto cerrado.
- **Garantía**: Rendimiento Core Web Vitals optimizado (verde en PageSpeed).

## Preguntas frecuentes
${localFaqs.map((f) => `### ${f.question}\n${f.answer}\n`).join("\n")}

---

Solicita tu landing page en [${siteUrl}/empezar](${siteUrl}/empezar) o escribe a [${identity.email}](mailto:${identity.email}).
`;
}

function getEmpezarMarkdown(): string {
  return `# Cuéntanos tu proyecto · Xync

> Dos minutos para contarnos qué necesitas: una pregunta cada vez, sin compromiso. Al terminar, decides si reservamos una llamada.

## ¿Qué tipo de proyectos realizamos?
1. **Crear una web o tienda online desde cero**: Con Next.js, Medusa.js o Shopify/custom.
2. **Arreglar y optimizar una web existente**: Mejorar velocidad, corregir fallos y optimizar conversión.
3. **Rediseño completo**: Interfaz moderna, accesible y alineada con la identidad de marca.

## Condiciones de trabajo
- Presupuesto cerrado y por escrito antes de empezar.
- Plazos claros (habitualmente entre 2 y 4 semanas).
- Comunicación directa con Alejandro Martín (sin intermediarios ni comerciales).

## Contacto directo
- **Email**: [${identity.email}](mailto:${identity.email})
- **Formulario online**: [${siteUrl}/empezar](${siteUrl}/empezar)
`;
}

function getLegalMarkdown(type: "aviso-legal" | "privacidad" | "cookies"): string {
  if (type === "aviso-legal") {
    return `# Aviso legal · Xync

En cumplimiento del artículo 10 de la Ley 34/2002 (LSSI-CE):
- **Titular**: ${legalEntity.legalName} (marca «${identity.name}»)
- **NIF**: ${legalEntity.nif}
- **Domicilio**: ${legalEntity.street}, ${legalEntity.postalCode} ${legalEntity.locality}, ${legalEntity.region} (${legalEntity.countryName})
- **Email**: ${identity.email}
- **Actividad**: Diseño y desarrollo de webs, tiendas online y productos digitales.
`;
  }

  if (type === "privacidad") {
    return `# Política de privacidad · Xync

Tratamiento de datos personales según el RGPD (UE 2016/679) y la LOPDGDD 3/2018:
- **Responsable**: ${legalEntity.legalName} (${identity.email})
- **Finalidad**: Gestión de solicitudes de presupuesto y contacto comercial.
- **Base jurídica**: Consentimiento expreso del interesado.
- **Derechos**: Acceso, rectificación, supresión y oposición mediante escrito a ${identity.email}.
`;
  }

  return `# Política de cookies · Xync

Este sitio web utiliza cookies técnicas estrictamente necesarias para el funcionamiento de la web y analítica anónima que respeta la privacidad sin almacenar identificadores de usuario persistentes.
`;
}

/**
 * Genera la representación Markdown para cualquier ruta de la web.
 */
export async function getRouteMarkdown(rawPath: string): Promise<string> {
  const path = normalizePath(rawPath);

  if (path === "/") {
    return getHomeMarkdown();
  }

  if (path === "/proyectos") {
    return getProjectsIndexMarkdown();
  }

  if (path.startsWith("/proyectos/")) {
    const slug = path.replace("/proyectos/", "");
    const projectMd = getProjectDetailMarkdown(slug);
    if (projectMd) return projectMd;
  }

  if (path === "/blog") {
    return await getBlogIndexMarkdown();
  }

  if (path.startsWith("/blog/")) {
    const slug = path.replace("/blog/", "");
    const postMd = await getBlogPostMarkdown(slug);
    if (postMd) return postMd;
  }

  if (path === "/landing-pages-negocios-locales") {
    return getLandingPagesMarkdown();
  }

  if (path === "/empezar") {
    return getEmpezarMarkdown();
  }

  if (path === "/aviso-legal") {
    return getLegalMarkdown("aviso-legal");
  }

  if (path === "/privacidad") {
    return getLegalMarkdown("privacidad");
  }

  if (path === "/cookies") {
    return getLegalMarkdown("cookies");
  }

  // Comprobar páginas de servicio dinámicas (/[slug])
  const serviceSlug = path.slice(1);
  const serviceMd = await getServiceMarkdown(serviceSlug);
  if (serviceMd) return serviceMd;

  // Fallback para rutas no encontradas
  return `# Página no encontrada · Xync

La página solicitada (\`${path}\`) no existe o no tiene una representación en Markdown disponible.

Puedes consultar el índice general en [${siteUrl}/llms.txt](${siteUrl}/llms.txt) o visitar la portada en [${siteUrl}](${siteUrl}).
`;
}
