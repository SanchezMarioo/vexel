import { defineField, defineType } from "sanity";

/**
 * Documento `post` del blog. Incluye además de los campos editoriales
 * clásicos: `intro` (primer párrafo citable de 134-167 palabras que la web
 * muestra como lede) y `cta` (llamada a la acción contextual del artículo).
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Extracto",
      type: "text",
      rows: 3,
      description: "Meta description y resumen de una línea en el listado (150-160 caracteres).",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "intro",
      title: "Introducción citable",
      type: "text",
      rows: 6,
      description:
        "Primer párrafo del artículo: autosuficiente, 134-167 palabras, responde directamente la pregunta del título. Es lo que citan los buscadores de IA.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Última actualización",
      type: "datetime",
      description: "Opcional; si falta se usa la fecha de publicación.",
    }),
    defineField({
      name: "featured",
      title: "Destacado",
      type: "boolean",
      description: "Se muestra grande arriba en /blog. Si ninguno está marcado, se usa el más reciente.",
      initialValue: false,
    }),
    defineField({
      name: "content",
      title: "Cuerpo",
      type: "array",
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
      name: "cta",
      title: "CTA contextual",
      type: "object",
      description: "Llamada a la acción al final del artículo, conectada con su tema. Si se deja vacía se usa una genérica de contacto.",
      fields: [
        defineField({ name: "title", title: "Titular", type: "string" }),
        defineField({ name: "text", title: "Texto", type: "text", rows: 2 }),
        defineField({ name: "label", title: "Texto del botón", type: "string" }),
        defineField({ name: "href", title: "Enlace", type: "string", description: "Ruta interna, p. ej. /#contacto" }),
      ],
    }),
    defineField({
      name: "coverImage",
      title: "Imagen de portada",
      type: "image",
      group: "seo",
      description: "Se usa para Open Graph/redes; el diseño del artículo es texto-first y no la muestra en cabecera.",
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
      name: "seoDescription",
      title: "Descripción SEO",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Opcional; si falta se usa el extracto.",
      validation: (rule) => rule.max(200),
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
      category: "category.title",
      media: "coverImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, category, media, publishedAt }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString("es") : "sin fecha";
      return {
        title,
        subtitle: `${category ?? "sin categoría"} · ${date}`,
        media,
      };
    },
  },
});
