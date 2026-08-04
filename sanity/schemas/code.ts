import { defineField, defineType } from "sanity";

/**
 * Bloque de código para el cuerpo del artículo. Objeto propio (sin plugin):
 * la web lo renderiza con la tipografía mono del sistema.
 */
export const codeType = defineType({
  name: "code",
  title: "Bloque de código",
  type: "object",
  fields: [
    defineField({
      name: "language",
      title: "Lenguaje",
      type: "string",
      options: {
        list: ["bash", "json", "typescript", "javascript", "css", "html", "groq", "text"],
        layout: "dropdown",
      },
      initialValue: "text",
    }),
    defineField({
      name: "code",
      title: "Código",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { language: "language", code: "code" },
    prepare({ language, code }) {
      const firstLine = typeof code === "string" ? code.split("\n")[0] : "";
      return { title: `Código (${language ?? "text"})`, subtitle: firstLine };
    },
  },
});
