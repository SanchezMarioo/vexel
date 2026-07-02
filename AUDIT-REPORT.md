# Auditoría GEO-SEO — Xync (incluye sección /proyectos)

**Sitio:** https://www.xync.es
**Entidad:** Alejandro Martín Herrero · marca **Xync** · Salamanca (Castilla y León, España)
**Stack:** Next.js 16.2.4 (App Router) + TypeScript · Vercel + Cloudflare
**Fecha:** 2026-07-02
**Método:** `/geo audit` con subagentes en paralelo sobre el sitio en vivo + análisis del código local + aplicación de mejoras.
**Nota de método:** 4 de los 5 subagentes se cortaron por límite de sesión; el de **visibilidad IA** entregó informe completo (citability, crawlers, llms.txt, brand) y las categorías restantes (técnico, contenido, schema, plataformas) se auditaron inline contra el HTML servido y el código fuente.

> Informes anteriores archivados: `AUDIT-REPORT-2026-06-18.md` y `AUDIT-REPORT-2026-06-23.md`.
> Sus acciones de código están todas aplicadas; el desbloqueo de bots IA en Cloudflare quedó
> verificado en vivo el 2026-06-25.

---

## 1. GEO Score: inicial vs final

| | GEO Score | Lectura |
|---|---|---|
| **Inicial** (producción, 2026-07-02) | **60 / 100** | La base técnica y el schema son fuertes, pero **la sección /proyectos entera devuelve 404 en producción**: el sitemap desplegado tiene solo 2 URLs y el llms.txt vivo lista 3 de 5 proyectos. El repo va muy por delante del deploy. |
| **Final** (código de este repo, efectivo al desplegar) | **≈ 69 / 100** | 8 URLs indexables, 5 casos de estudio citables con CreativeWork, llms.txt completo, metadatos corregidos. |
| **Proyectado** (tras acciones externas §5) | **≈ 80 / 100** | El lastre restante es Brand Authority (5/100), 100 % off-site. |

### Desglose por categoría

| Categoría | Peso | Inicial (prod.) | Final (código) | Estado |
|---|---|---|---|---|
| AI Citability & Visibility | 25 % | 68 | **78** | ✓ |
| Brand Authority | 20 % | 5 | **5** | ✗ (100 % externo — §5) |
| Content Quality & E-E-A-T | 20 % | 80 | **88** | ✓ |
| Technical Foundations | 15 % | 78 | **93** | ✓ |
| Structured Data | 10 % | 80 | **90** | ✓ |
| Platform Optimization | 10 % | 65 | **75** | ✓ |

**El hallazgo que domina esta auditoría no es de código: es el gap deploy↔repo.** Casi todo el
valor GEO construido (sección /proyectos, sitemap de 8 URLs, llms.txt completo) existe solo en
local. Verificado hoy en vivo: `/proyectos` → HTTP 404, sitemap con 2 URLs.

---

## 2. Cambios aplicados en esta auditoría, por archivo

Compila: `npm run build` ✓ (TypeScript sin errores, 21 páginas estáticas, los 5 slugs generados,
robots.txt y sitemap.xml emitidos).

### `lib/portfolio/content.ts` (Fases 3 y 6)
- **[CRÍTICO] Portada de Grieta rota**: `image.src` apuntaba a `/portfolio/hero-image.webp`,
  archivo que **no existe** (el real es `hero-images.webp`, y además es una captura de *Lumen*,
  no de Grieta). Ahora la portada es `grieta-detalle.webp` (captura real del catálogo de
  Grieta), con alt de moda + Salamanca, y el grid "Por dentro" queda con `grieta-detalle-2.webp`
  para no duplicar. Este bug estaba **en producción** (portada y og:image de Grieta rotos).
- **[CRÍTICO] `projectSeo` de `cenit` y `lumen` describían proyectos antiguos** (un panel de
  reservas y una clínica) que ya no existen. Las meta descriptions de esas dos páginas mentían
  sobre su contenido. Reescritas (150-160 chars, problema→resultado, "Salamanca"):
  - cenit: "Cenit vendía moda por Instagram y marketplaces pagando comisiones. Su tienda propia con sistema de drops, hecha en Salamanca: margen completo y clientes propios."
  - lumen: "Lumen tenía un catálogo de muebles que nadie encontraba en Google. Su ecommerce con catálogo filtrable, hecho en Salamanca: más visitas orgánicas y ventas."
- **Nueva FAQ answer-target** "¿Qué tecnología usáis para crear una tienda online?" (~120
  palabras, citable): ataca "desarrollador freelance para ecommerce con Medusa.js" y "tienda
  online sin comisiones", nombra los tres casos ecommerce (Grieta, Cenit, Lumen) y cierra con
  contacto. Se emite también en el JSON-LD `FAQPage` automáticamente (deriva de `faqs`).

### `app/proyectos/[slug]/page.tsx` (Fase 2)
- `CreativeWork` ahora incluye **`about: project.sector`** (lo único que faltaba del encargo:
  name, description, url, creator Organization Xync y locationCreated Salamanca ya estaban).

### `public/llms.txt` (Fase 5)
- **Añadidos Cenit y Lumen** (faltaban 2 de los 5 proyectos; el desplegado lista solo 3).
- Los proyectos enlazan ahora a sus **URLs canónicas** `/proyectos/[slug]` (antes solo demos en
  subdominios: un LLM que las seguía aprendía sobre la tienda, no sobre Xync) manteniendo la
  demo como enlace secundario. Añadido "Todos los proyectos" → `/proyectos`.

### `components/portfolio/Hero.tsx` y `components/portfolio/Contact.tsx` (Fase 3 — solo copy)
- **Alt del hero corregido**: decía "Tienda online Grieta" sobre la captura de **Lumen**
  (la ventana simulada ya enlazaba a lumen.xync.es). Ahora: Lumen + muebles + Salamanca.
- **Voz plural unificada** (quedaban 6 restos en singular): "Cuéntanos tu proyecto",
  "Cuéntanos qué quieres construir", "Escríbenos…" (×2), "Te respondemos… nos has dejado",
  placeholder del formulario. Sin ningún cambio de diseño.

### Verificado sin cambios necesarios (Fases 4 y 7)
- `app/robots.ts`: los 15 bots IA/buscadores permitidos — el subagente lo midió **100/100** en
  producción, sin bloques inyectados por Cloudflare.
- `app/sitemap.ts`: home + /proyectos + landing + 5 slugs ✓ (solo falta desplegarlo).
- Canonicals: cada página define el suyo (home `/`, /proyectos, cada slug, legales, landing) ✓.
- H1 único por página (Hero, ProjectsIndex, ProjectDetail, LegalLayout) ✓.
- Titles conformes al encargo: home keyword literal; "Proyectos · Xync — Desarrollo web
  Salamanca"; "[Nombre] · Xync — [Sector]" vía `generateMetadata` ✓.
- OG completo por tipología (og:title/description/url/image; el detalle usa la portada del
  proyecto) + twitter card ✓.
- `next/image` en todas las imágenes (vía `ImageSlot`, con width/height) y `next/font` con
  `display: swap` (Geist, Geist Mono, Bricolage Grotesque) ✓.

---

## 3. Estado por checklist (encargo original)

| Ítem | Estado |
|---|---|
| Robots permite GPTBot, ClaudeBot, PerplexityBot, GoogleBot, Bingbot | ✓ (100/100 en vivo) |
| Cloudflare sin bloques inyectados en robots.txt | ✓ (verificado hoy) |
| Cloudflare vs `ChatGPT-User` (Managed Rules) | ⚠ no verificable desde código — ver §5.2 |
| JSON-LD LocalBusiness (legalName, brand, email, address, areaServed, sameAs) | ✓ ya existente |
| CreativeWork por proyecto (name, description, url, creator, about, locationCreated) | ✓ (about añadido hoy) |
| llms.txt con los 5 proyectos + contacto | ✓ (corregido hoy) |
| Párrafo citable 134-167 palabras | ✓ (FAQ 1, ~135 palabras) |
| "Salamanca" ≥ 3 veces en contenido visible | ✓ (hero, FAQs, footer) |
| 5 proyectos con problema/solución/resultado | ✓ — sin métricas numéricas (ver §5.6) |
| Meta descriptions 150-160 con problema+resultado | ✓ (cenit y lumen corregidas hoy) |
| Alt texts con sector + Salamanca | ✓ (Grieta y hero corregidos hoy) |
| FAQs en lenguaje natural de búsqueda | ✓ (+1 nueva para Medusa.js) |
| Sitemap con home, /proyectos y 5 slugs | ✓ en código — ✗ en producción (2 URLs) |
| Canonical / OG / H1 único / next-image / next-font swap | ✓ |
| Consultas objetivo cubiertas con pasaje citable | ✓ "quién hace webs en Salamanca" (FAQ 1) · ✓ "tienda online sin comisiones" (FAQ 2) · ✓ "ecommerce Medusa.js" (FAQ nueva) |

---

## 4. Hallazgos de la auditoría en vivo (subagente de visibilidad IA)

- **AI Citability 68/100**: bloques muy citables (plazos "14 días", precios cerrados en €,
  FAQs con JSON-LD), pero superficie mínima — solo 2 URLs indexables en producción.
- **Brand Authority 5/100** (el gran lastre): cero presencia en Wikipedia (verificado por API),
  Reddit, YouTube, LinkedIn y directorios. `site:xync.es` sin resultados visibles; ante
  "desarrollo web Salamanca" los LLMs citarán a competidores (JSSM, Nokeon, Virtual Salamanca).
- **Colisión de marca**: existen xync.co, xync.net, xync.de… Desambiguar siempre como
  "Xync, estudio de desarrollo web en Salamanca" en bios y perfiles externos.
- **SSR 100 %**: todo el contenido y JSON-LD llegan en el HTML inicial sin JS.
- Sugerencia menor (no aplicada — `MetadataRoute.Robots` no soporta directivas custom):
  `Content-Signal` en robots.txt. Requeriría servir robots como texto estático; valor bajo.

---

## 5. Acciones pendientes EXTERNAS (por orden de impacto)

1. **🔴 Desplegar este repo a producción.** Es la acción nº 1 con diferencia: /proyectos y los
   5 casos (404 hoy), el sitemap de 8 URLs, el llms.txt completo y todos los fixes de hoy no
   existen para Google ni para los LLMs hasta que se publiquen.
2. **🟠 Cloudflare — `ChatGPT-User`**: el bloqueo masivo de bots IA se desactivó el 25-jun
   (verificado), pero el UA `ChatGPT-User` (navegación en vivo de ChatGPT) pudo quedar afectado
   por una Managed Rule y **no es verificable desde código**. Comprobar en Cloudflare →
   Security → Bots / AI Crawl Control que `ChatGPT-User`, `OAI-SearchBot` y `Perplexity-User`
   reciben 200, no challenge/403.
3. **🟠 Google Search Console**: tras el deploy, reenviar `sitemap.xml` y solicitar indexación
   de `/proyectos` y de los 5 slugs (grieta, the-byte, lumiere, cenit, lumen). Hacer lo mismo
   en Bing Webmaster Tools (alimenta ChatGPT Search y Copilot).
4. **🟠 Google Business Profile**: crear y verificar la ficha (categoría "Diseñador de páginas
   web", NAP idéntico al schema). Señal dominante para "quién hace webs en Salamanca".
5. **🟠 Brand Authority (5/100)**: LinkedIn (página de empresa + perfil de Alejandro), GitHub
   público, Malt/Workana, directorios de Salamanca y Castilla y León. Al crear perfiles,
   añadir las URLs a `identity.socials` en `content.ts` → entran solas en `sameAs`.
6. **🟡 Métricas reales para los 5 casos**: los resultados actuales son cualitativos ("más
   ventas directas"). Los LLMs citan cifras ("−30 % comisiones", "LCP 1,2 s"). **No se
   inventaron números en esta auditoría** — pedirlos a los clientes y añadirlos a `result`.
7. **🟡 TikTok (@xyncdev)**: enlazar xync.es en la bio para cerrar la verificación de entidad
   del `sameAs`.

---

## 6. Resumen ejecutivo

El código está en un estado GEO excelente: robots 100/100, grafo JSON-LD conectado
(Person + LocalBusiness/ProfessionalService + WebSite + FAQPage + CollectionPage +
CreativeWork), SSR completo, metadatos correctos en las tres tipologías y llms.txt completo.
Esta sesión corrigió dos errores de contenido serios que ya estaban en producción (portada de
Grieta rota y meta descriptions de Cenit/Lumen describiendo proyectos que ya no existen),
completó el CreativeWork con `about`, añadió la FAQ de Medusa.js y unificó la voz plural.

**Nada de esto rinde hasta desplegar**: producción sirve una versión sin la sección de
proyectos. Tras el deploy, el techo del score (~69) lo pone Brand Authority (5/100), que se
trabaja fuera del código (§5.4-5.5).

---

*Generado por `/geo audit` el 2026-07-02. Validar el JSON-LD en https://validator.schema.org/
y solicitar indexación en GSC tras desplegar.*
