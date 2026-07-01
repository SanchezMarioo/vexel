# Auditoría GEO-SEO — Xync

**Sitio:** https://www.xync.es
**Entidad:** Alejandro Martín Herrero · marca **Xync** · Salamanca (Castilla y León, España)
**Stack:** Next.js 16.2.4 (App Router) + TypeScript · Vercel + Cloudflare
**Fecha:** 2026-06-23
**Método:** `/geo audit` — 5 subagentes en paralelo (AI visibility, platforms, technical, content, schema) sobre el sitio en vivo + aplicación de mejoras en código.

> Existe un informe anterior archivado en `AUDIT-REPORT-2026-06-18.md`. Sus issues P0/P1
> (canonical a `localhost`, ausencia de "Salamanca", páginas legales, schema sin `geo`)
> **ya están resueltos** en el código actual; esta auditoría parte de ese estado mejorado.

---

## 1. GEO Score: inicial vs final

| | GEO Score | Lectura |
|---|---|---|
| **Inicial** (sitio en vivo auditado el 2026-06-23) | **54 / 100** | Fair — base técnica fuerte, lastrada por crawlers de IA bloqueados, baja autoridad de marca y falta de contenido citable. |
| **Actual** (en vivo: código desplegado + bots IA desbloqueados, verificado 2026-06-25) | **≈ 70 / 100** | Good — crawlers IA con acceso (HTTP 200), schema `LocalBusiness`+`FAQPage`, `llms.txt` y párrafo citable servidos en producción. |
| **Proyectado** (tras autoridad de marca externa) | **≈ 80 / 100** | El salto restante depende **solo de presencia externa** (GBP, LinkedIn, GitHub, Wikidata…). |

> **Clave del informe (actualizada 2026-06-25):** el cuello de botella nº1 —Cloudflare bloqueaba
> a los crawlers de IA— **ya está RESUELTO** (verificado en vivo). Todas las mejoras de código
> están **desplegadas**. El único lastre grande que queda es **Brand Authority (12/100)**, que
> es 100% externo: la marca aún no tiene presencia que la IA pueda corroborar.

### Desglose por categoría

| Categoría | Peso | Inicial | Actual (en vivo) | Estado |
|---|---|---|---|---|
| AI Citability & Visibility | 25% | 50 | **83** | ✓ (bots desbloqueados + llms.txt + párrafo citable) |
| Brand Authority Signals | 20% | 12 | **12** | ✗ (100% externo) |
| Content Quality & E-E-A-T | 20% | 78 | **88** | ✓ |
| Technical Foundations | 15% | 88 | **93** | ✓ (crawlers IA con acceso) |
| Structured Data | 10% | 68 | **85** | ✓ |
| Platform Optimization | 10% | 38 | **70** | ✓ (ChatGPT/Perplexity ya pueden recuperar) |

---

## 2. Cambios aplicados, por archivo

Todos los cambios se editaron directamente en el repositorio y **el proyecto compila**
(`npm run build` ✓, TypeScript sin errores, robots/sitemap generados OK).

### `components/StructuredData.tsx` — Datos estructurados (Fase 2)
- **Tipo dual** en el nodo de negocio: `"@type": ["LocalBusiness", "ProfessionalService"]`.
  Cumple el requisito de `LocalBusiness` del encargo sin perder la especificidad de
  `ProfessionalService` (es su subtipo: hereda `address`, `geo`, `areaServed`, `priceRange`).
- Añadido `legalName: "Alejandro Martín Herrero"` y `brand: "Xync"` al negocio.
- **Nuevo nodo `FAQPage`** en el `@graph`, derivado de `faqs` (fuente única en `content.ts`,
  sin duplicar copy). Conectado por `isPartOf`/`about`. Era el issue ALTO señalado por 2
  subagentes: convierte las 8 preguntas en pares Q&A citables por ChatGPT/Perplexity/Gemini.
- **Sanitizado anti-XSS**: `JSON.stringify(...).replace(/</g, "<")` según la
  recomendación oficial de la guía JSON-LD de Next.js 16.

### `lib/portfolio/content.ts` — Contenido y E-E-A-T (Fases 3 y 6)
- **Párrafo citable autosuficiente de ~135 palabras** en la 1ª FAQ: entidad + ubicación +
  servicios + tecnologías (Next.js/React/Medusa.js) + plazo + precio + contacto. Es el bloque
  "ancla" que un AI Overview puede extraer como fuente única (rango objetivo 134–167: ✓).
- **Autor visible**: el nombre real **Alejandro Martín Herrero** ahora aparece en contenido
  visible (antes solo en JSON-LD). Resuelve la mayor fuga de E-E-A-T.
- **Nueva FAQ answer-target** para la query objetivo *"cómo crear una tienda online sin
  comisiones"* (la de mayor potencial), citando el caso Grieta.
- **Títulos de proyecto con keywords** (los "PROYECTO 1/2/3" desperdiciaban headings):
  `Grieta — Tienda online sin comisiones` · `The Byte — Periódico digital optimizado para SEO`
  · `Lumière — Web de restaurante con carta dinámica`.
- **Alt local** en la imagen del proyecto destacado ("…estudio de desarrollo web en Salamanca").

### `app/robots.ts` — Crawlers IA (Fase 4)
- Reescrito con **reglas explícitas de `Allow` por user-agent** para 15 bots de IA y
  buscadores (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, anthropic-ai,
  PerplexityBot, Perplexity-User, Googlebot, Google-Extended, Bingbot, CCBot,
  Applebot-Extended, Amazonbot, meta-externalagent), manteniendo `Disallow` de rutas privadas.
- ⚠️ **El origen ya permitía todo**: el bloqueo real lo añade Cloudflare (ver §3). Estas
  reglas son una declaración de intención, pero **no anulan el WAF de Cloudflare**.
- *No se creó `public/robots.txt`*: habría entrado en conflicto con esta Route Handler.

### `public/llms.txt` — NUEVO (Fase 5)
- `llms.txt` según el estándar llmstxt.org: qué es Xync, servicios, localización (Salamanca),
  proyectos de referencia (Grieta, The Byte, Lumière) y contacto (contacto@xync.es).
- Servido desde la raíz: `https://www.xync.es/llms.txt`.

### `app/layout.tsx` — SEO técnico (Fase 7)
- Eliminado `<meta name="keywords">` (ignorado por Google, ruido).
- **Sin cambios** en title/description/OG/Twitter/canonical: ya estaban óptimos (ver §4).

---

## 3. ✅ Hallazgo crítico nº1 — Cloudflare bloqueaba a los crawlers de IA → RESUELTO (2026-06-25)

> **Estado actual:** verificado en vivo el 2026-06-25 — el `robots.txt` de producción ya **no**
> contiene el bloque "Cloudflare Managed Content", y GPTBot, ClaudeBot, PerplexityBot y
> OAI-SearchBot devuelven **HTTP 200** (antes 403). El `Block AI bots` de Cloudflare está
> desactivado y el código nuevo (`app/robots.ts`) está desplegado. **Nada más que hacer aquí.**

Lo que la auditoría inicial (2026-06-23) había detectado, para referencia histórica:

- `app/robots.ts` (origen) **permite** todos los crawlers.
- **Cloudflare** añade un bloque "Managed Content" con `Disallow: /` para **GPTBot, ClaudeBot,
  Google-Extended, CCBot, Bytespider, Amazonbot…** y declara `Content-Signal: ai-train=no`.
- Peor aún: el **WAF de Cloudflare devuelve HTTP 403** a **OAI-SearchBot** y **PerplexityBot**
  — los bots de *búsqueda en vivo* de ChatGPT y Perplexity. No pueden ni recuperar la página.
- Lo que **sí** funciona: Googlebot y Bingbot no están bloqueados (alimentan Google AI
  Overviews y Bing Copilot).

➡️ **Acción:** Panel de Cloudflare → *Scrape Shield / AI Crawl Control* (o "Bots" → "Block AI
bots") → **desactivar el bloqueo** o permitir explícitamente OAI-SearchBot, PerplexityBot,
ChatGPT-User, Perplexity-User, GPTBot, ClaudeBot y Google-Extended. **Hasta hacer esto, gran
parte del resto de optimizaciones GEO no rinde** (los bots de IA no ven el llms.txt, el schema
ni el contenido citable).

---

## 4. Estado por checklist técnico (Fase 7)

| Ítem | Estado | Valor |
|---|---|---|
| `title` ≤ 60 chars con keyword local | ✓ | "Desarrollador web freelance en Salamanca \| Xync" (47) |
| `description` 150–160 chars con keywords locales | ✓ | 158 chars |
| og:image / og:url / og:title / og:description | ✓ | `/opengraph-image` (1200×630) + completos |
| twitter:card | ✓ | `summary_large_image` |
| canonical | ✓ | `https://www.xync.es` (self-ref) |
| sitemap.xml | ✓ | `app/sitemap.ts` (dinámico) — NO se duplicó en `/public` |
| Un solo H1 con keyword principal | ✓ | "Desarrollamos webs, tiendas online y productos digitales en Salamanca…" |
| H2 con variaciones de keywords | ✓ | "Casos reales de webs y tiendas online…", etc. |
| `next/image` en todas las imágenes | ✓ | confirmado |
| `next/font` con `display: swap` | ✓ | Geist, Geist_Mono, Bricolage_Grotesque |
| `<meta name="keywords">` eliminado | ✓ | quitado en esta auditoría |
| `<html lang="es">` | ✓ | presente |
| HTTPS + HSTS + redirecciones canónicas | ✓ | http→https, apex→www (308) |

> **Nota title:** el encargo sugería `Xync · Desarrollo web en Salamanca`. **No se aplicó**
> porque el title vigente (`Desarrollador web freelance en Salamanca | Xync`) ataca
> directamente una keyword objetivo, cumple ≤60 chars y es estratégicamente superior.

---

## 5. Acciones pendientes EXTERNAS (no son código)

Ordenadas por impacto. Mueven el score de ~70 a ~80; son responsabilidad del cliente.

### ✅ Prioridad 1 — Desbloquear crawlers de IA en Cloudflare → HECHO (2026-06-25)
Ver §3. Verificado en vivo: los bots de IA acceden con HTTP 200. El cuello de botella nº1
está resuelto y todo el código está desplegado.

### 🟠 Prioridad 2 — Google Business Profile (GBP)
- Crear y **verificar** la ficha para Salamanca, categoría "Diseñador de páginas web", con
  **NAP idéntico** al del schema (Calle Pizarrales 38, 37003 Salamanca).
- Señal dominante para "quién hace webs en Salamanca" en Gemini y AI Overviews locales;
  habilita reseñas reales (que alimentan E-E-A-T).

### ✅ Prioridad 3 — Google Search Console → propiedad dada de alta (2026-06-25)
- Propiedad verificada (por DNS/Analytics; no hay meta tag en el HTML). `sitemap.xml` responde
  HTTP 200 con las 2 URLs.
- **Pasos que quedan dentro de GSC:** enviar el `sitemap.xml` en *Sitemaps* y usar *Inspección
  de URL → Solicitar indexación* para la home y `/landing-pages-negocios-locales`, para que
  Google recoja cuanto antes el contenido nuevo (schema, párrafo citable).

### 🟠 Prioridad 4 — Autoridad de entidad externa (Brand Authority: 12/100)
La categoría más baja y 100% off-site. Prioridad:
- **LinkedIn**: página de empresa "Xync — Desarrollo web, Salamanca" + perfil de Alejandro.
  Resuelve una colisión de marca (existe un "Xync Inc." de EE. UU. no relacionado).
- **GitHub**: organización pública (señal de expertise técnico de alto peso para IA).
- **Wikidata**: ítem "Xync (estudio de desarrollo web, Salamanca)".
- Tras crearlos, **añadir las URLs a `identity.socials`** en `content.ts`; el filtro
  `isRealUrl` ya las emitirá automáticamente en `sameAs` del JSON-LD.

### 🟡 Prioridad 5 — Backlinks y directorios locales (España)
- Páginas Amarillas, directorios de Salamanca/Castilla y León, Malt, Clutch, asociaciones
  y medios locales.

### 🟡 Prioridad 6 — Menciones en plataformas que la IA cita
- **Reddit** (r/SpainTech, r/webdev en ES): aportar valor real en preguntas sobre "tienda
  online sin comisiones", enlazando el caso Grieta cuando sea pertinente.
- **YouTube**: un caso de estudio en vídeo.
- **LinkedIn**: publicaciones periódicas de los proyectos.

### 🟢 Prioridad 7 — Mejoras de contenido que requieren datos reales del cliente
- **Cuantificar los casos** (Grieta/The Byte/Lumière) con métricas reales. *No se inventaron
  cifras en esta auditoría.*
- **Verificar los testimonios** (Carlos Mendoza, Sophie Arnaud): si son reales, añadir
  ciudad/enlace; si son demos, etiquetarlos o sustituirlos por reseñas de GBP. *No se tocaron
  por ser datos del cliente.*
- Considerar `Cache-Control` público para la home (hoy es dinámica por `getServerSession` en
  el layout): mejoraría TTFB/LCP. Requiere refactor de auth, fuera del alcance SEO.

---

## 6. Resumen ejecutivo

**Ya estaba muy bien** (no se tocó): SSR completo, seguridad de primer nivel (HSTS, CSP),
metadata, Open Graph dinámico, canonical, un solo H1 con keyword, `next/image`, `next/font`
con swap, JSON-LD bien conectado por `@id`.

**Se mejoró en código** (este trabajo): schema `LocalBusiness` + `FAQPage` + sanitizado,
párrafo citable de 135 palabras, autor visible, FAQ "tienda sin comisiones", títulos con
keywords, alt local, robots reforzado, `llms.txt` nuevo, limpieza de meta keywords.
**Compila correctamente.**

**Ya hecho desde la auditoría inicial:** ✅ desbloqueo de crawlers IA en Cloudflare + despliegue
de todo el código (verificado en vivo 2026-06-25). El sitio pasó de **54 a ~70**.

**Falta y NO es código** (mueve el score de ~70 a ~80): Google Business Profile, Search Console,
y construir autoridad de marca (LinkedIn, GitHub, Wikidata, Reddit, directorios locales). Es la
categoría **Brand Authority (12/100)**, hoy el único lastre grande.

---

*Generado por `/geo audit` + aplicación de mejoras. Validar el JSON-LD final en
https://validator.schema.org/ y las Core Web Vitals en PageSpeed Insights tras desplegar.*
