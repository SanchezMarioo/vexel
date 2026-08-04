import { createClient } from "@sanity/client";
import { blogPosts } from "../lib/content/blog";
import { legalEntity } from "../lib/portfolio/content";

/**
 * Script de migración de contenido local (lib/content/blog.ts) a Sanity.
 *
 * Idempotente: usa IDs deterministas (post-${slug}, category-${slug},
 * author-xync) y `createOrReplace` para que se pueda ejecutar varias veces
 * sin duplicar datos.
 *
 * Requisitos:
 *   - Variables en .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID,
 *     NEXT_PUBLIC_SANITY_DATASET y SANITY_API_WRITE_TOKEN (token con permiso
 *     de escritura).
 *
 * Uso:
 *   pnpm seed:sanity
 */

try {
  process.loadEnvFile(".env.local");
} catch (err) {
  if (err instanceof Error && (err as NodeJS.ErrnoException).code !== "ENOENT") {
    console.warn("No se pudo cargar .env.local:", err.message);
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "❌ Define NEXT_PUBLIC_SANITY_PROJECT_ID y SANITY_API_WRITE_TOKEN en .env.local antes de ejecutar el seed.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: false,
  token,
});

/** Parsea los enlaces inline [texto](url) del texto local a markDefs + spans. */
function parseInlineSpans(text: string) {
  const spans: Array<{ _type: "span"; _key: string; text: string; marks?: string[] }> = [];
  const markDefs: Array<{ _key: string; _type: "link"; href: string }> = [];

  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
  let lastIndex = 0;
  let keyIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const [raw, label, href] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      spans.push({
        _type: "span",
        _key: `s${keyIndex++}`,
        text: text.slice(lastIndex, index),
      });
    }

    const markKey = `m${keyIndex++}`;
    markDefs.push({ _key: markKey, _type: "link", href });
    spans.push({
      _type: "span",
      _key: `s${keyIndex++}`,
      text: label,
      marks: [markKey],
    });

    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    spans.push({
      _type: "span",
      _key: `s${keyIndex++}`,
      text: text.slice(lastIndex),
    });
  }

  return { spans, markDefs };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seed() {
  console.log("🌱 Migrando contenido local a Sanity...");

  // 1. Autor único (Alejandro Martín Herrero)
  const authorId = "author-xync";
  await client.createOrReplace({
    _id: authorId,
    _type: "author",
    name: legalEntity.legalName,
    slug: { _type: "slug", current: "xync" },
    bio: "Desarrollador web freelance en Salamanca.",
  });
  console.log(`  ✓ Autor: ${legalEntity.legalName}`);

  // 2. Categorías únicas
  const categories = Array.from(new Set(blogPosts.map((p) => p.category)));
  const categoryIdMap = new Map<string, string>();

  for (const cat of categories) {
    const catSlug = slugify(cat);
    const catId = `category-${catSlug}`;
    await client.createOrReplace({
      _id: catId,
      _type: "category",
      title: cat,
      slug: { _type: "slug", current: catSlug },
    });
    categoryIdMap.set(cat, catId);
    console.log(`  ✓ Categoría: ${cat}`);
  }

  // 3. Artículos con Portable Text mapeado
  for (const [index, post] of blogPosts.entries()) {
    const postId = `post-${post.slug}`;
    const categoryId = categoryIdMap.get(post.category);

    const ptContent = post.content.map((block, bIdx) => {
      const key = `b${bIdx}`;

      switch (block.type) {
        case "paragraph": {
          const { spans, markDefs } = parseInlineSpans(block.text);
          return {
            _type: "block",
            _key: key,
            style: "normal",
            children: spans,
            markDefs,
          };
        }
        case "heading": {
          const { spans, markDefs } = parseInlineSpans(block.text);
          return {
            _type: "block",
            _key: key,
            style: `h${block.level}`,
            children: spans,
            markDefs,
          };
        }
        case "quote": {
          const { spans, markDefs } = parseInlineSpans(block.text);
          return {
            _type: "block",
            _key: key,
            style: "blockquote",
            children: spans,
            markDefs,
          };
        }
        case "list": {
          // El list del modelo del sitio tiene varias frases; en PT cada frase es un block con listItem
          return block.items.map((item, iIdx) => {
            const { spans, markDefs } = parseInlineSpans(item);
            return {
              _type: "block",
              _key: `${key}_${iIdx}`,
              style: "normal",
              listItem: block.style,
              level: 1,
              children: spans,
              markDefs,
            };
          });
        }
        case "evidence": {
          return {
            _type: "evidence",
            _key: key,
            text: block.text,
            projectSlug: block.projectSlug,
            projectName: block.projectName,
          };
        }
        case "image": {
          return {
            _type: "image",
            _key: key,
            alt: block.alt,
            caption: block.caption,
          };
        }
        case "code": {
          return {
            _type: "code",
            _key: key,
            language: block.language,
            code: block.code,
          };
        }
      }
    }).flat();

    await client.createOrReplace({
      _id: postId,
      _type: "post",
      title: post.title,
      slug: { _type: "slug", current: post.slug },
      excerpt: post.excerpt,
      intro: post.intro,
      category: { _type: "reference", _ref: categoryId },
      author: { _type: "reference", _ref: authorId },
      publishedAt: `${post.publishedAt}T10:00:00Z`,
      featured: index === 0, // El primero se marca como destacado
      content: ptContent,
      cta: post.cta,
    });

    console.log(`  ✓ Artículo (${index + 1}/${blogPosts.length}): ${post.title}`);
  }

  console.log("✅ Migración completada con éxito.");
}

seed().catch((error) => {
  console.error("❌ Error durante la migración:", error);
  process.exit(1);
});
