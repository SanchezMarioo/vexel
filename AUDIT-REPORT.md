# AUDIT-REPORT — Xync (xync.es)

**Estrategia SEO completa · desarrollador web freelance · Salamanca, España**
Fecha: 2026-06-18 · Auditoría sobre código fuente (Next.js 16.2.4 App Router) + HTML en producción.

> Método: auditoría *white-box*. Se revisó el código real **y** el HTML servido en
> `https://www.xync.es` (HTTP 200, 62 KB). No se usó solo el HTML renderizado, así que
> los hallazgos apuntan a la línea exacta a corregir.

---

## 0. Resumen ejecutivo

**SEO Health Score: 60/100 (estructural).** La base técnica es sólida (cabeceras de
seguridad de nivel alto, `next/font` self-host, imágenes en webp con `aspect-ratio`,
un solo `<h1>`, sitemap/robots/manifest correctos). **Pero hay un fallo P0 que ahora
mismo impide que el sitio se indexe bien**, y falta por completo la capa local de
Salamanca sobre la que se apoya todo el encargo.

| Bloque | Estado | Nota |
|---|---|---|
| Indexación / canonical | 🔴 Roto | `canonical = http://localhost:3000` en producción |
| Metadatos (title/desc/OG) | 🟠 Mejorable | Correctos pero sin señal local; OG image apunta a localhost |
| Core Web Vitals | 🟡 Riesgo | LCP gateado por animación de entrada; resto bien |
| Schema local | 🟠 Incompleto | Sin geo, areaServed granular, knowsAbout; sameAs roto |
| SEO local (Salamanca) | 🔴 Ausente | 0 menciones de Salamanca / sin NAP en toda la web |
| Contenido / E-E-A-T | 🟡 Bien con fugas | Proyectos reales; faltan legales, testimonios verificables |
| GEO / IA | 🟡 Parcial | Crawlers IA permitidos y FAQ citables; sin señales de entidad |

**El número clave:** el 60/100 es el *techo* del sitio. Hoy el rendimiento real es
menor porque el P0 de canonical está suprimiendo la indexación. **Arregla el P0 y el
trabajo P1 y el techo estructural pasa a ser tu suelo.**

### Lista de prioridades (de un vistazo)

- **P0 (bloquea indexación — hoy):** 1 issue → canonical/OG/JSON-LD a `localhost:3000`.
- **P1 (impacto fuerte — esta semana):** capa local ausente · schema local incompleto ·
  riesgo de LCP · páginas legales (RGPD/LSSICE) · bug `[España y LATAM]` · title/desc sin intención local.
- **P2 (optimización — este mes):** acentos eliminados en página secundaria · FAQPage sin
  rich result · Testimonios sin `<h2>` y sin verificar · imagen del hero duplicada ·
  pasajes citables para IA · construcción de entidad externa.

---

## P0 · Bloquea indexación (arréglalo HOY)

### P0-1 · Canonical, og:url, og:image y todo el JSON-LD apuntan a `http://localhost:3000`

**Evidencia (HTML en vivo de `https://www.xync.es`):**
```html
<link rel="canonical" href="http://localhost:3000"/>
<meta property="og:url" content="http://localhost:3000"/>
<meta property="og:image" content="http://localhost:3000/opengraph-image?..."/>
<meta name="twitter:image" content="http://localhost:3000/opengraph-image?..."/>
```
Y los dos bloques JSON-LD en vivo (`Person`, `ProfessionalService`) tienen
`"url": "http://localhost:3000"` e `"image": "http://localhost:3000/opengraph-image"`.

**Causa raíz:** **no está en el código.** [app/layout.tsx:9](app/layout.tsx#L9) y
[app/page.tsx:14](app/page.tsx#L14) hacen `process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.xync.es"`.
El fallback es correcto, y `.env.local` **no** define esa variable (cae bien en local).
Por tanto el `localhost:3000` viene de la **variable de entorno en Vercel**
(`NEXT_PUBLIC_SITE_URL=http://localhost:3000`), que se *inlinea en build* y queda
congelada en el bundle de producción. La búsqueda `localhost` en el código solo aparece
en CSP de desarrollo ([next.config.ts:10](next.config.ts#L10), condicionado a `isDev`) — limpio.

**Por qué es P0:** un canonical a un host inalcanzable (`localhost`) le dice a Google que
la URL real **no es la canónica**. Resultado: la home puede quedar sin indexar o con la
señal de canonicalización ignorada; los previews sociales y las imágenes para AI Overviews
no cargan; y `url`/`image` del schema quedan inválidos (entidad rota).

**Arreglo (2 pasos):**
1. **Vercel → Project `vexel` → Settings → Environment Variables:** pon
   `NEXT_PUBLIC_SITE_URL = https://www.xync.es` en **Production** (y Preview/Development con
   su valor correcto), borra el `http://localhost:3000`, y **redeploy** (las `NEXT_PUBLIC_*`
   solo cambian al reconstruir).
2. **Blindaje en código** (para que no vuelva a pasar): sustituye el resolutor en
   `layout.tsx` y `page.tsx` por uno que rechace localhost en producción:
   ```ts
   const RAW = process.env.NEXT_PUBLIC_SITE_URL;
   const siteUrl = RAW && RAW.startsWith("https://") ? RAW : "https://www.xync.es";
   ```

**Cómo sé que está arreglado (falsabilidad):**
`curl -s https://www.xync.es | grep canonical` debe devolver `href="https://www.xync.es/"`.
En Search Console → Inspección de URL → "Canónica seleccionada por Google" = `https://www.xync.es/`.

---

## P1 · Impacto fuerte en ranking (esta semana)

### P1-1 · La capa local de Salamanca no existe (0 señales en toda la web)
**Evidencia:** `grep -i "salamanca|castilla"` sobre todo el repo (`.ts/.tsx/.md/.css`) → **0
resultados**. El HTML en vivo tampoco menciona Salamanca. El `<title>` es
`Xync · Desarrollador web freelance` ([app/page.tsx:16](app/page.tsx#L16)) — sin ciudad.
No hay NAP (nombre-dirección-teléfono) en ninguna parte; el `Footer`
([components/portfolio/Footer.tsx](components/portfolio/Footer.tsx)) solo muestra email.

**Por qué importa:** sin ninguna mención de Salamanca/Castilla y León, el sitio no puede
posicionar en "desarrollador web Salamanca" ni aparecer en el local pack ni ser citado por
IA para "web en Salamanca". Es el cuello de botella de las FASES 3, 5 y 6.

**Arreglo (mínimo viable):**
- `<title>` home → `Desarrollador web freelance en Salamanca | Xync` (47 car.).
- `description` → incluir "en Salamanca" + servicio + resultado (ver
  [SEO-COPY-AI-OVERVIEWS.md](SEO-COPY-AI-OVERVIEWS.md)).
- Footer: añadir línea **NAP** consistente: `Xync · Salamanca, Castilla y León (España) · xyncdev@gmail.com`
  (+ teléfono si decides publicarlo). Esta cadena exacta debe repetirse igual en GBP,
  LinkedIn y directorios.
- Hero: una frase de ámbito ("Con base en Salamanca, trabajo para toda España y LATAM en remoto").
- Schema: `areaServed` + `geo` + `address` (ver P1-2).

**Falsabilidad:** `curl -s https://www.xync.es | grep -i salamanca` devuelve ≥3 coincidencias
(title, hero, footer). Search Console empieza a registrar impresiones para consultas con "Salamanca".

### P1-2 · Schema local incompleto y `sameAs` roto
**Evidencia:** [app/page.tsx:42-63](app/page.tsx#L42-L63). El `ProfessionalService` tiene
`areaServed: "ES"` plano, **sin** `geo`, `address`, `priceRange`, ni `areaServed` granular.
El `Person` no tiene `knowsAbout` ni `address`. El `sameAs` se construye desde
`identity.socials` ([lib/portfolio/content.ts:114-117](lib/portfolio/content.ts#L114-L117)),
donde **GitHub es un placeholder** `https://github.com/[usuario]` (lo filtra `isRealUrl`, así
que en vivo `sameAs` solo contiene Discord) y **no hay LinkedIn**.

**Arreglo:** reemplazar ambos bloques por el grafo `Person → ProfessionalService → WebSite`
validado en [SEO-SCHEMA-JSONLD.tsx](SEO-SCHEMA-JSONLD.tsx) (incluye `geo` de Salamanca,
`areaServed` Salamanca/Castilla y León/España, `knowsAbout` y `sameAs`). Sustituir los 2
placeholders por LinkedIn/GitHub reales (o borrarlos: nunca dejar URLs inventadas).

**Falsabilidad:** [validator.schema.org](https://validator.schema.org/) y la prueba de
Resultados Enriquecidos de Google dan 0 errores y detectan `ProfessionalService` con `areaServed`.

### P1-3 · Riesgo de LCP: el `<h1>` del hero está gateado por una animación de entrada
**Evidencia:** el `<h1>` usa la variante `clipUp`
([lib/portfolio/motion.ts:33-41](lib/portfolio/motion.ts#L33-L41)):
`hidden: { opacity: 0, y: "0.4em", clipPath: "inset(0 0 100% 0)" }` durante **1,1 s**, y el
hero arranca con `initial="hidden" animate="visible"` en
[components/portfolio/Hero.tsx:13-25](components/portfolio/Hero.tsx#L13-L25). La imagen del
hero también arranca en `opacity:0` (`fadeUp`) con `delayChildren: 0.35`. En móvil, el `<h1>`
es el elemento LCP (la imagen apila debajo) → **no pinta a opacidad plena hasta ~1,1 s tras
la hidratación**. El comentario del código dice "mask, not opacity gate", pero `opacity: 0`
sí está presente.

**Arreglo:** que el contenido *above-the-fold* del hero no dependa de JS para pintarse.
Opciones: (a) en `clipUp`, quitar `opacity: 0` del estado `hidden` (deja solo el `clipPath`/`y`
— la máscara revela sin ocultar el pixel para LCP); (b) o `initial={false}` en el `<h1>`/imagen
del hero; (c) o animar desde `opacity: 1`. El resto de secciones (con `whileInView`) están bien.

**Falsabilidad:** PageSpeed Insights (móvil) → LCP < 2,5 s; en el trace, el elemento LCP es el
`<h1>` y su tiempo no coincide con el fin de la animación. (Hoy el endpoint público de PSI
estaba sin cuota; el sitio es nuevo y aún no tiene datos de campo CrUX, así que mide en lab.)

### P1-4 · Faltan páginas legales (RGPD + LSSI-CE) — obligatorio en España y señal de confianza
**Evidencia:** no hay rutas `/aviso-legal`, `/privacidad`, `/cookies` (no están en
[app/sitemap.ts](app/sitemap.ts) ni en `app/`). El formulario de contacto recoge datos
personales (nombre, email) en [components/portfolio/Contact.tsx:150-177](components/portfolio/Contact.tsx#L150-L177)
**sin** política de privacidad enlazada ni checkbox de consentimiento.

**Por qué importa:** (1) cumplimiento legal — un negocio español que capta leads necesita
Aviso Legal + Política de Privacidad + Cookies; (2) E-E-A-T — Google valora estas señales de
*Trust*; (3) es un patrón que los evaluadores y la IA reconocen como negocio real.

**Arreglo:** crear las 3 páginas (indexables o no, pero accesibles), enlazarlas desde el footer,
y añadir checkbox de consentimiento + enlace a privacidad en el formulario.

**Falsabilidad:** las 3 rutas devuelven 200 y están enlazadas en el footer; el formulario no
deja enviar sin marcar consentimiento.

### P1-5 · Bug de contenido: `[España y LATAM]` literal en una respuesta de FAQ
**Evidencia:** [lib/portfolio/content.ts:282](lib/portfolio/content.ts#L282) —
`"Sí, con clientes de [España y LATAM]."` Los corchetes se renderizan tal cual en la home.
Además mezcla la señal de mercado (LATAM) en una página que quieres anclar a Salamanca.

**Arreglo:** redactar definitivo, p. ej. `"Sí. Trabajo en remoto con clientes de toda España
y de Latinoamérica; lo importante es la comunicación clara y los plazos cumplidos."` (es-ES).

**Falsabilidad:** `grep -R "\[" lib/portfolio/content.ts` no devuelve corchetes en textos visibles.

### P1-6 · Title y description sin intención local
**Evidencia:** dos sistemas de metadatos conviven: el `default` de
[app/layout.tsx:32-34](app/layout.tsx#L32-L34) (`Webs de conversión para negocios ambiciosos`)
y el `absolute` de la home en [app/page.tsx:16-18](app/page.tsx#L16-L18)
(`Xync · Desarrollador web freelance`). Ninguno contiene "Salamanca" ni un servicio-keyword
como "diseño web". Ver propuestas concretas en [SEO-COPY-AI-OVERVIEWS.md](SEO-COPY-AI-OVERVIEWS.md).

---

## P2 · Optimización (este mes)

### P2-1 · La página secundaria tiene los acentos/ñ eliminados (defecto es-ES)
**Evidencia:** [app/landing-pages-negocios-locales/page.tsx](app/landing-pages-negocios-locales/page.tsx):
meta y JSX con `"Disenamos"`, `"diseno"`, `"14 dias"`, `"Inversion"`, `"friccion"`,
`"Auditoria"`, `"Listo para empezar?"` (sin `¿`). Importante: el **dato** de FAQ
([lib/content/faqs.ts](lib/content/faqs.ts)) sí tiene acentos correctos; el defecto está solo
en el JSX/meta hardcodeado de esa página. Para el mercado España es un signo de baja calidad.

**Arreglo:** reescribir esa página en es-ES correcto (diseñamos, días, inversión, fricción,
auditoría, ¿…?). Aprovecha para añadirle señal local si la conviertes en página de servicio.

### P2-2 · FAQPage en la página secundaria ya no da rich result (retirado may-2026)
**Evidencia:** [app/landing-pages-negocios-locales/page.tsx:35-46](app/landing-pages-negocios-locales/page.tsx#L35-L46)
emite `FAQPage`. Google retiró los rich results de FAQ para **todos** los sitios el 7-may-2026.
**No la borres:** el contenido Q&A sigue siendo oro para **citación en IA** (AI Overviews,
ChatGPT, Perplexity). Solo: no esperes estrella/acordeón en el SERP y no añadas más `FAQPage`
buscando ese efecto. (Tal y como pediste: nada de FAQPage para rich results, nada de HowTo.)

### P2-3 · La sección Testimonios no tiene `<h2>`
**Evidencia:** [components/portfolio/Testimonials.tsx:9-12](components/portfolio/Testimonials.tsx#L9-L12)
usa `aria-label="Testimonios"` pero ningún encabezado visible. Rompe ligeramente la jerarquía
y resta extracción para IA.
**Arreglo:** añadir un `<h2>` (idealmente en formato que el cliente busca), p. ej.
`Qué dicen los negocios con los que he trabajado`.

### P2-4 · Testimonios sin verificar (riesgo E-E-A-T)
**Evidencia:** [lib/portfolio/content.ts:238-251](lib/portfolio/content.ts#L238-L251) — "Carlos
Mendoza / Grieta" y "Sophie Arnaud / Lumière". Si no son reales/atribuibles, son un riesgo de
*Trust*. **Arreglo:** usa testimonios reales con permiso, nombre + empresa verificables y, si es
posible, resultado cuantificado (`+30% reservas entre semana`). Los proyectos sí son reales
(URLs en vivo `grieta.xync.es`, `thebyte.xync.es`, `lumiere.xync.es`) — esa es tu mejor señal de *Experience*.

### P2-5 · Imagen del hero duplicada como proyecto Grieta
**Evidencia:** [lib/portfolio/content.ts:193](lib/portfolio/content.ts#L193) — el proyecto Grieta
usa `src: "/portfolio/hero-image.webp"`, el mismo archivo del hero. No existe `proyecto-1.webp`.
**Arreglo:** captura propia de la tienda Grieta como `proyecto-1.webp`.

### P2-6 · Construcción de entidad para IA (GEO) y citabilidad
Ver [SEO-COPY-AI-OVERVIEWS.md](SEO-COPY-AI-OVERVIEWS.md). Resumen: añadir pasajes
auto-contenidos de 134-167 palabras, encabezados en formato pregunta, y sobre todo **señales
externas de la entidad Xync** (GBP, LinkedIn, GitHub, 3-5 directorios). Hoy `robots.ts` permite
los crawlers de IA (GPTBot, Google-Extended, etc. — `userAgent: "*"`), lo cual es correcto para GEO.

### P2-7 · Limpieza menor
- `PRODUCT.md:21` dice "Voxel" (marca antigua) — corregir a Xync. Solo doc interno.
- `package.json name` sigue siendo `"seller-landing-page"` — cosmético.

---

## Lo que YA está bien (no tocar)

- **Cabeceras de seguridad** de nivel alto en [next.config.ts:23-59](next.config.ts#L23-L59):
  CSP estricta, HSTS con preload, `X-Content-Type-Options`, COOP/CORP, Permissions-Policy.
- **Fuentes** vía `next/font` self-host con `display: swap` ([app/layout.tsx:11-30](app/layout.tsx#L11-L30))
  → sin petición de fuente que bloquee el render. `globals.css` solo importa Tailwind (build-time).
- **Imágenes**: `next/image` con `fill`, `sizes`, `priority`/`fetchPriority` en el hero y
  `aspect-ratio` para CLS ([components/portfolio/ui/ImageSlot.tsx](components/portfolio/ui/ImageSlot.tsx));
  webp servido, AVIF activado en config.
- **Third-party**: el embed de Cal.com (~40 KB) se carga **diferido** on-interaction/idle
  ([components/portfolio/ui/CalButton.tsx:63-108](components/portfolio/ui/CalButton.tsx#L63-L108))
  → buen INP/TBT.
- **Estructura**: un solo `<h1>`, `lang="es"`, viewport correcto, `skip-link`, `robots`/`sitemap`/
  `manifest` presentes, `reduced-motion` respetado.
- **No hay FAQPage en la home ni HowTo en ningún sitio** — alineado con tus restricciones.

---

## Plan de acción secuenciado (con dependencias)

| # | Acción | Prioridad | Desbloquea |
|---|--------|-----------|-----------|
| 1 | Fijar `NEXT_PUBLIC_SITE_URL=https://www.xync.es` en Vercel + redeploy + guard en código | **P0** | TODO. Sin esto, lo demás no cuenta |
| 2 | Inyectar el grafo schema ([SEO-SCHEMA-JSONLD.tsx](SEO-SCHEMA-JSONLD.tsx)) con LinkedIn/GitHub reales | P1 | Local + GEO |
| 3 | Añadir señal local: title/desc/H-area/footer NAP de Salamanca | P1 | FASE 3/5/6 |
| 4 | Quitar el gate de opacidad del hero (LCP) | P1 | CWV |
| 5 | Crear Aviso Legal + Privacidad + Cookies + consentimiento | P1 | Trust/legal |
| 6 | Corregir `[España y LATAM]` y los acentos de la página secundaria | P1/P2 | Calidad |
| 7 | Pasajes citables + encabezados-pregunta + `<h2>` en Testimonios | P2 | GEO |
| 8 | Crear GBP (área de servicio) + LinkedIn + GitHub + 3-5 directorios NAP | P2 | Entidad/GEO |

---

## Entregables relacionados
- **Schema listo para pegar** → [SEO-SCHEMA-JSONLD.tsx](SEO-SCHEMA-JSONLD.tsx)
- **Clusters de keywords + volumen estimado** → [SEO-KEYWORDS.md](SEO-KEYWORDS.md)
- **Copy para citabilidad en AI Overviews** → [SEO-COPY-AI-OVERVIEWS.md](SEO-COPY-AI-OVERVIEWS.md)
- **Checklist técnico antes de publicar** → [SEO-PRE-PUBLISH-CHECKLIST.md](SEO-PRE-PUBLISH-CHECKLIST.md)
