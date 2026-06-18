# SEO-PRE-PUBLISH-CHECKLIST — Antes de publicar / promocionar

Marca cada caja. **No promociones (anuncios, GBP, link building) hasta cerrar los P0/P1**:
gastarías tráfico contra una página que no se indexa bien.

## 🔴 Bloqueantes (P0/P1) — obligatorio antes de publicar

- [ ] **`NEXT_PUBLIC_SITE_URL` = `https://www.xync.es`** en Vercel (Production) + **redeploy**.
- [ ] Verificado: `curl -s https://www.xync.es | grep canonical` → `href="https://www.xync.es/"`
      (NO `localhost`). Repite para `og:url`, `og:image`, `twitter:image`.
- [ ] Guard anti-localhost añadido en `app/layout.tsx` y `app/page.tsx`
      (`RAW.startsWith("https://") ? RAW : "https://www.xync.es"`).
- [ ] Schema del grafo `Person→ProfessionalService→WebSite` pegado (de [SEO-SCHEMA-JSONLD.tsx](SEO-SCHEMA-JSONLD.tsx)),
      y **eliminados** los `personJsonLd`/`serviceJsonLd` viejos de `app/page.tsx` (sin duplicar).
- [ ] `sameAs` con **LinkedIn + GitHub reales** (o esas líneas borradas, sin placeholders).
- [ ] Señal local presente: "Salamanca" en `<title>`, hero y footer (NAP).
- [ ] Bug `[España y LATAM]` corregido en `lib/portfolio/content.ts:282`.
- [ ] Páginas legales creadas y enlazadas en footer: **Aviso Legal, Política de Privacidad, Cookies**.
- [ ] Formulario de contacto: checkbox de **consentimiento** + enlace a privacidad.
- [ ] Hero sin gate de opacidad para el LCP (quitar `opacity:0` de `clipUp`/`fadeUp` en el hero).

## 🟢 Indexación y rastreo

- [ ] Propiedad creada en **Google Search Console** (dominio o prefijo `https://www.xync.es`).
- [ ] **Sitemap enviado** en GSC (`https://www.xync.es/sitemap.xml`) y devuelve 200.
- [ ] `robots.txt` correcto (`https://www.xync.es/robots.txt`): permite `/`, bloquea
      `/api/ /auth/ /cuenta/ /admin/`, declara el sitemap. *(Ya está en [app/robots.ts](app/robots.ts).)*
- [ ] Inspección de URL de la home en GSC → "La URL está en Google" / solicitar indexación.
- [ ] Sin `noindex` accidental (la home tiene `index, follow` ✅).
- [ ] 1 solo `<h1>` por página (home ✅). Jerarquía H1→H2→H3 sin saltos (añadir `<h2>` a Testimonios).
- [ ] `www` vs no-`www`: una sola versión canónica; la otra redirige 301 a `https://www.xync.es`.
- [ ] `http://` redirige a `https://` (HSTS ya con preload en [next.config.ts:55-58](next.config.ts#L55-L58)).

## 🟡 Metadatos y social

- [ ] `<title>` único y con intención local por página (ver [SEO-COPY-AI-OVERVIEWS.md](SEO-COPY-AI-OVERVIEWS.md) §2).
- [ ] `description` única por página, ~150 car., con ciudad + beneficio + CTA.
- [ ] `canonical` correcto y absoluto en cada página.
- [ ] OG image carga (1200×630, `app/opengraph-image.tsx` ✅) — verifícala en
      [opengraph.xyz](https://www.opengraph.xyz/) con la URL real (no localhost).
- [ ] Preview de Twitter/X y de WhatsApp/Telegram correctos.

## 🟡 Core Web Vitals (objetivo: LCP<2,5s · INP<200ms · CLS<0,1)

- [ ] PageSpeed Insights **móvil** de la home: Performance ≥ 90, LCP < 2,5 s.
- [ ] El elemento LCP (el `<h1>` en móvil) **no** coincide en tiempo con el fin de la animación.
- [ ] CLS < 0,1 (imágenes con `width/height`/`aspect-ratio` ✅; `next/font` ✅).
- [ ] INP < 200 ms (Cal.com diferido ✅; comprobar que abrir FAQ y enviar form responde <200ms).
- [ ] Imágenes del hero/proyectos en webp/avif y con peso razonable (`hero-image.webp` 176 KB — ok;
      crear `proyecto-1.webp` propio en vez de reusar el hero).

## 🟢 Local (Salamanca) — FASE 3

- [ ] **GBP** creado como negocio de área de servicio (sin dirección pública), categoría
      "Diseñador de páginas web", área = Salamanca + provincia.
- [ ] **NAP idéntico** en web, GBP, LinkedIn y directorios:
      `Xync — Salamanca, Castilla y León (España) — xyncdev@gmail.com`.
- [ ] `areaServed` + `geo` + `address(locality/region)` en el schema (incluidos en el grafo).
- [ ] Una sola landing local de base. **NO** crear páginas por ciudad sin demanda real
      (máx. 30 páginas de localización; doorway pages = penalización).

## 🟢 GEO / IA — FASE 6

- [ ] Crawlers de IA permitidos (GPTBot, Google-Extended, PerplexityBot…) — `robots` con `*` ✅.
- [ ] ≥3 pasajes auto-contenidos de 134-167 palabras visibles (de [SEO-COPY-AI-OVERVIEWS.md](SEO-COPY-AI-OVERVIEWS.md) §4).
- [ ] FAQ visibles como contenido (no solo schema). **No** añadir nuevos `FAQPage` esperando rich
      result (retirado may-2026); **no** usar `HowTo` (retirado sep-2023).
- [ ] Entidad Xync con ≥3 señales externas (GBP + LinkedIn + GitHub).

## 🧪 Validación final (comandos)

```bash
# Canonical/OG sin localhost
curl -s https://www.xync.es | grep -Ei 'canonical|og:url|og:image'
# Schema: pega el HTML en https://validator.schema.org/ y en la prueba de Resultados Enriquecidos
# Sin restos de marca antigua ni placeholders
grep -RinE "voxel|vexel|\[usuario\]|localhost" app lib components   # esperado: 0 en salida pública
```

## ♿ Calidad / a11y (ya en buen estado, confirmar)

- [ ] Contraste WCAG AA en textos principales (declarado en PRODUCT.md).
- [ ] `skip-link` y navegación por teclado ✅ ([app/layout.tsx:110](app/layout.tsx#L110)).
- [ ] `prefers-reduced-motion` respetado ✅.
- [ ] es-ES correcto en TODAS las páginas (corregir acentos de `/landing-pages-negocios-locales`).
