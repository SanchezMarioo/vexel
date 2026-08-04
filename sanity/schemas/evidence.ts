import { defineField, defineType } from "sanity";

/**
 * Bloque "Caso real": evidencia de un proyecto propio dentro del artículo.
 * La web lo renderiza con etiqueta mono y enlace a /proyectos/[slug].
 */
export const evidenceType = defineType({
  name: "evidence",
  title: "Caso real (proyecto)",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Texto",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projectSlug",
      title: "Slug del proyecto",
      type: "string",
      description: "Segmento de URL en /proyectos/, p. ej. grieta, lumen, cenit…",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projectName",
      title: "Nombre del proyecto",
      type: "string",
      description: "Cómo se muestra, p. ej. Grieta, Lumière, Lumen…",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { projectName: "projectName", text: "text" },
    prepare({ projectName, text }) {
      const excerpt = typeof text === "string" ? text.slice(0, 60) : "";
      return { title: `Caso real · ${projectName ?? "?"}`, subtitle: excerpt };
    },
  },
});
