import { defineField, defineType } from "sanity";

/**
 * Página comercial publicada directamente bajo la raíz: /[slug].
 * El estado editorial es explícito para que los borradores nunca entren en
 * rutas públicas, sitemap ni resultados de SEO.
 */
export const serviceType = defineType({
  name: "service",
  title: "Página de servicio",
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
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "contenido",
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
        { type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Texto alternativo", type: "string" }), defineField({ name: "caption", title: "Pie de imagen", type: "string" })] },
        { type: "code" },
        { type: "evidence" },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "faq",
      title: "Preguntas frecuentes",
      type: "array",
      group: "contenido",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "question", title: "Pregunta", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "answer", title: "Respuesta", type: "text", rows: 5, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        },
      ],
    }),
    defineField({
      name: "cta",
      title: "CTA de contacto",
      type: "object",
      group: "contenido",
      description: "Llamada a la acción específica de esta página de servicio.",
      fields: [
        defineField({ name: "title", title: "Pregunta / titular", type: "string" }),
        defineField({ name: "text", title: "Texto", type: "text", rows: 3 }),
        defineField({ name: "label", title: "Texto del botón", type: "string" }),
        defineField({
          name: "href",
          title: "Enlace",
          type: "string",
          description: "Por ejemplo: /#contacto",
        }),
      ],
    }),
    defineField({ name: "updatedAt", title: "Fecha de actualización", type: "datetime", group: "seo" }),
    defineField({
      name: "ogImage",
      title: "Imagen Open Graph",
      type: "image",
      group: "seo",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Texto alternativo", type: "string" })],
    }),
    defineField({ name: "seoTitle", title: "Título SEO", type: "string", group: "seo", description: "Si falta, se usa el título de la página." }),
    defineField({ name: "metaDescription", title: "Meta description", type: "text", rows: 3, group: "seo", validation: (rule) => rule.required().max(200) }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current", status: "status", media: "ogImage" },
    prepare({ title, slug, status, media }) {
      return { title, subtitle: `/${slug ?? "sin-slug"} · ${status ?? "sin estado"}`, media };
    },
  },
});
