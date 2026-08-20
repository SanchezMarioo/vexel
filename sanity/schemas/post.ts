import { defineField, defineType } from "sanity";

/**
 * Documento `post` del blog. Alineado con la estructura modular de las páginas
 * de servicio (grupos Contenido/SEO, estado, hero, contenido, FAQ, CTA y SEO).
 */
export const postType = defineType({
  name: "post",
  title: "Artículo",
  type: "document",
  groups: [
    { name: "contenido", title: "Contenido", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      group: "contenido",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "contenido",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      group: "contenido",
      options: {
        list: [
          { title: "Publicado", value: "published" },
          { title: "Borrador", value: "draft" },
        ],
        layout: "radio",
      },
      initialValue: "published",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "contenido",
      description: "Opcional: cabecera enriquecida con antetítulo, título e imagen.",
      fields: [
        defineField({ name: "eyebrow", title: "Antetítulo", type: "string" }),
        defineField({ name: "title", title: "Título del hero", type: "string" }),
        defineField({ name: "text", title: "Texto", type: "text", rows: 4 }),
        defineField({
          name: "image",
          title: "Imagen",
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Texto alternativo", type: "string" })],
        }),
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Extracto",
      type: "text",
      rows: 3,
      group: "contenido",
      description: "Meta description y resumen de una línea en el listado (150-160 caracteres).",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "intro",
      title: "Introducción citable",
      type: "text",
      rows: 6,
      group: "contenido",
      description:
        "Primer párrafo del artículo: autosuficiente, 134-167 palabras, responde directamente la pregunta del título. Es lo que citan los buscadores de IA.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "reference",
      to: [{ type: "category" }],
      group: "contenido",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
      group: "contenido",
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      group: "contenido",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Destacado",
      type: "boolean",
      group: "contenido",
      description: "Se muestra grande arriba en /blog. Si ninguno está marcado, se usa el más reciente.",
      initialValue: false,
    }),
    defineField({
      name: "content",
      title: "Contenido",
      type: "array",
      group: "contenido",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Cita", value: "blockquote" },
          ],
          lists: [
            { title: "Viñetas", value: "bullet" },
            { title: "Numerada", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Negrita", value: "strong" },
              { title: "Cursiva", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Enlace",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.required().uri({
                        allowRelative: true,
                        scheme: ["https", "http", "mailto"],
                      }),
                  }),
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
              description: "Obligatorio por accesibilidad: describe la imagen.",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Pie de imagen",
              type: "string",
            }),
          ],
        },
        { type: "code" },
        { type: "evidence" },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faq",
      title: "Preguntas frecuentes",
      type: "array",
      group: "contenido",
      description: "Preguntas frecuentes que se mostrarán al final del artículo y en datos estructurados Schema FAQPage.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Pregunta",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Respuesta",
              type: "text",
              rows: 5,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        },
      ],
    }),
    defineField({
      name: "cta",
      title: "CTA de contacto / contextual",
      type: "object",
      group: "contenido",
      description: "Llamada a la acción al final del artículo, conectada con su tema. Si se deja vacía se usa una genérica de contacto.",
      fields: [
        defineField({ name: "title", title: "Titular", type: "string" }),
        defineField({ name: "text", title: "Texto", type: "text", rows: 3 }),
        defineField({ name: "label", title: "Texto del botón", type: "string" }),
        defineField({
          name: "href",
          title: "Enlace",
          type: "string",
          description: "Ruta interna, p. ej. /#contacto",
        }),
      ],
    }),
    defineField({
      name: "updatedAt",
      title: "Fecha de actualización",
      type: "datetime",
      group: "seo",
      description: "Opcional; si falta se usa la fecha de publicación.",
    }),
    defineField({
      name: "coverImage",
      title: "Imagen de portada",
      type: "image",
      group: "seo",
      description: "Se usa para Open Graph/redes; el diseño del artículo es texto-first y no la muestra en cabecera a menos que se configure en Hero.",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Texto alternativo", type: "string" }),
      ],
    }),
    defineField({
      name: "ogImage",
      title: "Imagen Open Graph",
      type: "image",
      group: "seo",
      description: "Opcional; si falta se usa la portada y, en su defecto, la imagen OG del sitio.",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Texto alternativo", type: "string" }),
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "Título SEO",
      type: "string",
      group: "seo",
      description: "Opcional; si falta se usa el título del artículo.",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Opcional; si falta se usa el extracto.",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "seoDescription",
      title: "Descripción SEO (alias)",
      type: "text",
      rows: 3,
      group: "seo",
      hidden: true,
      description: "Mantenido por retrocompatibilidad con registros existentes.",
    }),
  ],
  orderings: [
    {
      title: "Fecha de publicación (reciente primero)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      status: "status",
      category: "category.title",
      media: "ogImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, slug, status, category, media, publishedAt }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString("es") : "sin fecha";
      return {
        title,
        subtitle: `/${slug ?? "sin-slug"} · ${category ?? "sin categoría"} · ${status ?? "publicado"} · ${date}`,
        media,
      };
    },
  },
});
