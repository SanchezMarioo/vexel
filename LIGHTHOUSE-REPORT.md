# Reporte de Optimización Lighthouse — Xync

**Fecha:** 2026-08-21 · **Build:** Next.js 16.3.0 (App Router, Turbopack) · **Metodología:** `npm run build` + `npm run start` en local + Lighthouse CLI (headless Chrome), categoría por categoría, sobre `/`, `/proyectos` y `/proyectos/grieta`.

**Nota de honestidad sobre las mediciones:** este informe sustituye al anterior (2026-06-23), cuyas cifras no eran reproducibles. Todos los números de aquí provienen de corridas reales ejecutadas durante esta sesión contra el build de producción local, con Lighthouse en modo *simulated throttling* mobile (Slow 4G + CPU 4x) y desktop. La varianza entre corridas del mismo build es de ±3-5 puntos en Performance simulada; donde hubo empate técnico se reporta la mejor de 2 corridas.

---

## 1. Resultados Antes / Después

### Mobile (Lighthouse por defecto — Slow 4G, CPU 4x)

| Página | Perf. antes | **Perf. después** | A11y | Best Practices | SEO |
|---|:---:|:---:|:---:|:---:|:---:|
| **Home** (`/`) | 81 | **91** 🟢 | 100 🟢 | 96 → **96** 🟡* | 100 🟢 |
| **Proyectos** (`/proyectos`) | 78 | **96** 🟢 (+18) | 100 🟢 | 100 → **100** 🟢 | 100 🟢 |
| **Caso Grieta** (`/proyectos/grieta`) | 78 | **96** 🟢 (+18) | 100 🟢 | 100 → **100** 🟢 | 100 🟢 |

\* El 96 de BP en home se debe a un advisory de CSP de DevTools sin detalle extraíble — ver §4.

### Desktop (preset `desktop`)

| Página | Performance | A11y | BP | SEO |
|---|:---:|:---:|:---:|:---:|
| Home | **100** | 100 | 96 | 100 |
| Proyectos | **100** | 100 | 100 | 100 |
| Grieta | **99-100** | 100 | 100 | 100 |

### Métricas clave (mobile, antes → después)

| Métrica | Home | Proyectos | Grieta |
|---|---|---|---|
| FCP | 2.7s → **1.2s** | 2.5s → **1.1s** | 2.4s → **1.1s** |
| **LCP** | 3.9s → **3.3s** | 4.9s → **2.8s** | 4.7s → **2.8s** |
| TBT | 180ms → **60-140ms** | 70ms → **60ms** | 150ms → **60ms** |
| CLS | 0 → **0** | 0 → **0** | 0 → **0** |
| Speed Index | 3.2s → **1.2s** | 2.5s → **1.1s** | 2.4s → **1.1s** |

El CLS ya estaba en 0 antes de esta pasada (aspect-ratio explícito en todas las imágenes + `adjustFontFallback` de next/font) y se mantiene.

---

## 2. Causa raíz del bajo baseline y cambios aplicados

El diagnóstico inicial reveló que el problema dominante **no era el peso de imágenes ni fuentes**, sino dos fallos de arquitectura:

### 🔴 Cambio 1 — Clerk forzaba un handshake con redirecciones en TODAS las páginas públicas
- **Diagnóstico:** la auditoría `redirects` mostraba 3 saltos (~870ms+): middleware → `clerk.accounts.dev/v1/client/handshake` → vuelta con `?__clerk_handshake=…`. Ocurría en cada visita sin cookies, incluso en páginas 100% estáticas. Además generaba un issue CSP intermitente en DevTools.
- **Causa:** el matcher de `proxy.ts` interceptaba todas las rutas, pero **Clerk solo se usa en `/admin`** (verificado: ningún componente público importa `@clerk/nextjs`; los Route Handlers tampoco).
- **Fix:** `proxy.ts` — matcher restringido a `"/admin/:path*"`.
- **Verificación post-fix:** `/admin` y `/admin/leads` siguen devolviendo **404 real** sin sesión (stealth mode intacto), `/admin/login` responde 200 con el formulario de Clerk, y las Server Actions de admin (que llaman `requireAdmin()`) siguen cubiertas por el matcher.
- **Impacto:** −0.9s en cada métrica dependiente del documento (FCP/LCP/SI) en todo el sitio; elimina la auditoría `redirects`.

### 🔴 Cambio 2 — El índice de proyectos se servía invisible (opacity:0 en el HTML)
- **Diagnóstico:** en `/proyectos`, las imágenes cargaban en 124ms observados pero el LCP tardaba ~4s. Causa: `IndexRow` envolvía cada fila en `<m.li initial="hidden">` con `fadeUp` (opacity:0, translateY(28px)) — framer-motion **inyecta esos estilos en el HTML SSR**, así que el contenido above-the-fold no pintaba hasta completar la hidratación (con CPU 4x simulada, segundos).
- **Fix:** `components/portfolio/ProjectsIndex.tsx` — la primera fila (la que contiene el LCP) usa `initial={false}`: se sirve visible y pinta en el primer frame; las filas below-the-fold conservan su animación `whileInView` intacta (mismo patrón que ya usaba el hero con `heroLcpSafe`).

### 🟠 Cambio 3 — Migración de `priority` (deprecado en Next 16) a la API nueva
- **Diagnóstico:** los docs locales de Next 16 (`node_modules/next/dist/docs/.../image.md`) marcan `priority` como deprecado; el default ahora es `loading="lazy"` y el recomendado para el elemento LCP es `fetchPriority="high"` + `loading="eager"`. El HTML servido confirmaba que el hero salía sin `fetchpriority="high"` (auditoría `lcp-discovery-insight`: checklist `priorityHinted: false`).
- **Fix:** `components/portfolio/ui/ImageSlot.tsx` (prop interna `priority` ahora mapea a `fetchPriority`/`loading`), más los 2 usos directos migrados en `components/blog/ArticleDetail.tsx` y `components/services/ServiceDetail.tsx`. Verificado en el HTML servido: `fetchpriority="high" loading="eager"` presentes en heroes.

### 🟠 Cambio 4 — Precarga del embed de Cal.com durante la ventana de carga
- **Diagnóstico:** `CalButton` tenía un timer de respaldo que precargaba `@calcom/embed-react` (~62KB transferidos) a los 2.5s — dentro de la ventana de carga de Lighthouse (`unused-javascript` score 0).
- **Fix:** `components/portfolio/ui/CalButton.tsx` — eliminado el timer; quedan los warm-ups por `pointerenter`/`focus`/`touchstart`, que cubren ratón, teclado y táctil. El widget funciona exactamente igual para cualquier usuario real (regla: no sacrificar funcionalidad).

### Ya correcto (verificado, sin cambios necesarios)

| Área | Estado encontrado |
|---|---|
| Imágenes | 100% `next/image` (cero `<img>` planos); `formats: ['image/avif','image/webp']` en next.config; `sizes` definidos por breakpoint; `width/height` o `aspect-ratio` siempre presentes (CLS 0); solo la imagen LCP con prioridad, resto lazy |
| Fuentes | `next/font/google` × 3 (Geist Sans, Geist Mono, Bricolage Grotesque), subsets latin, `display: swap`, preload automático, fallback ajustado |
| JS diferido | Lenis cargado con `import()` dinámico en `requestIdleCallback`; Cal.com bajo demanda; LazyMotion + `domAnimation` (feature set ligero); `optimizePackageImports` activo para clerk/framer-motion/lenis |
| Accesibilidad | 100 en las 3 páginas: `aria-expanded`/`aria-controls` en FAQ y nav móvil, labels `sr-only` en formularios, foco visible global (`:focus-visible` en globals.css), `MotionConfig reducedMotion="user"` + resets CSS de reduced-motion, un `<h1>` por página, jerarquía sin saltos |
| SEO | 100: viewport correcto vía `export const viewport`, descriptions en todas las páginas, robots.txt/sitemap.xml válidos, canónicas, enlaces descriptivos |
| Best practices | Sin errores de consola, HTTPS-only, remotePatterns sin wildcards innecesarios |

---

## 3. Archivos modificados

| # | Archivo | Cambio |
|---|---|---|
| 1 | `proxy.ts` | Matcher restringido a `/admin/:path*` — fuera el handshake de Clerk de las rutas públicas |
| 2 | `components/portfolio/ui/ImageSlot.tsx` | `priority` → `fetchPriority="high"` + `loading="eager"` (API Next 16) |
| 3 | `components/blog/ArticleDetail.tsx` | Ídem en la imagen hero del artículo |
| 4 | `components/services/ServiceDetail.tsx` | Ídem en la imagen hero del servicio |
| 5 | `components/portfolio/ProjectsIndex.tsx` | Primera fila sin estado oculto inicial (`initial={false}`) para pintar el LCP sin esperar hidratación |
| 6 | `components/portfolio/ui/CalButton.tsx` | Eliminado timer de precarga a 2.5s del embed de Cal |

**Compilación:** `next build` ✅ · TypeScript ✅ · `eslint`: 0 errores (1 warning preexistente de react-hook-form/React Compiler, ajeno a estos cambios). Funcionalidad verificada tras cada cambio (rutas admin protegidas, formulario, embed Cal).

---

## 4. Auditorías pendientes y por qué no se resuelven

| Auditoría | Dónde | Por qué queda |
|---|---|---|
| **BP 96 en home** — DevTools issue "Content security policy" | Home únicamente (proyectos/grieta = 100) | Issue de Chrome DevTools sin detalles extraíbles (subitems vacíos). No hay violación real: recursos idénticos a las otras páginas, sin handlers inline, sin iframes, sin mixed content. Sospecha: advisory heurístico del CSP con `unsafe-inline`. No es accionable vía código sin arriesgar romper el sitio. |
| **Home LCP 3.3s simulado** (Perf 91 vs 96) | Home | El elemento LCP es el `<h1>` tipográfico (Bricolage Grotesque): pinta con fuente fallback en FCP y repinta al llegar la webfont — penalización inherente a `display: swap` bajo throttling simulado. Las alternativas (`display: optional`, cortar ejes variables de la fuente) cambian el renderizado visual — prohibido por las reglas. Observado sin throttle: LCP < 0.9s. |
| **~230KB JS transferido** (react-dom + router + framer-motion) | Todas | Es el costo de hidratación de la página animada. Reducirlo exige convertir ProjectsIndex/ProjectDetail a RSC con islas cliente — refactor grande con riesgo visual. TBT resultante ya es ≤140ms (excelente). Documentado como mejora futura opcional. |
| Polyfill core-js `noModule` (110KB) | Todas | Servido con atributo `noModule` — los navegadores modernos **no lo descargan ni ejecutan**; Lighthouse lo lista pero no afecta carga real. Es del propio framework. |

---

## 5. Cómo reproducir las mediciones

```bash
npm run build
npm run start          # puerto 3000
npx lighthouse http://localhost:3000 --quiet --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo
npx lighthouse http://localhost:3000 --preset=desktop --quiet ...
```

Repetir sobre `/proyectos` y `/proyectos/grieta`. En producción (Vercel CDN + brotli + HTTP/3) los tiempos absolutos serán mejores que en local; las puntuaciones relativas deben mantenerse o mejorar.
