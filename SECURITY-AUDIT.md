# Auditoría de Seguridad — Xync (Segunda Pasada, Verificación Independiente)

**Proyecto:** Xync (Estudio Digital) · https://www.xync.es
**Stack real verificado:** Next.js 16.3 (App Router) + TypeScript + Tailwind 4 + Framer Motion + Supabase (leads) + Clerk (auth) + Resend (email) + Telegram (alertas) + Cloudflare Turnstile + Upstash (rate limit) + Sanity CMS
**Fecha:** 2026-08-21
**Alcance:** Verificación independiente de las correcciones de la auditoría del 2026-08-20 + búsqueda de hallazgos nuevos. **No se ha confiado en el informe anterior: cada punto se ha comprobado contra el código real.**
**Nota de contexto:** El stack descrito en la petición (Google Sheets webhook, sin auth) estaba desactualizado — la persistencia ya es Supabase y la autenticación es Clerk. La auditoría se ejecutó contra el estado real del repo.

---

## Resumen Ejecutivo

| Severidad | Hallazgos abiertos |
|---|---|
| 🔴 Crítico | **0** — El crítico histórico (SEC-01, fail-open en `checkIsAdmin`) fue verificado como corregido en `lib/admin/auth.ts:28` |
| 🟡 Medio | **2** — Secreto huérfano de Apps Script aún activo · Vulnerabilidades high transitivas de Sanity (requieren cambio mayor) |
| 🟢 Bajo | **4** — Chat ID real en `.env.example` (corregido) · `SANITY_REVALIDATE_SECRET` ausente en local · CSP con `unsafe-inline` · código muerto + nombre de variable inconsistente |

**Correcciones aplicadas automáticamente en esta pasada:** 3 (ver tabla al final).
**Pendientes de tu decisión:** 5 (ver sección correspondiente).

---

## FASE 1 — Secretos y Variables de Entorno

### Verificaciones superadas ✅

1. **Sin secretos hardcodeados.** Escaneo con patrones de claves (OpenAI `sk-`, Resend `re_`, Google `AIza`, Slack `xox`, GitHub `ghp`, AWS `AKIA`, JWTs, URLs de Apps Script/Slack) sobre todo el árbol (excl. `node_modules`/`.next`): **0 resultados**.
2. **`.gitignore` correcto.** `.env`, `.env.local`, `.env*.local` excluidos. `git ls-files` confirma que **solo `.env.example`** está trackeado; `.env.local` no está en el repo.
3. **Historial de git limpio.** Escaneo completo de los **120 commits** (`git rev-list --all`) buscando patrones de secretos en cada blob versionado, más búsqueda dirigida de URLs de Apps Script (`script.google.com`) y webhooks de Slack en todo el histórico con `git log -p --all -S`: **sin hallazgos**. No es necesario rotar credenciales por exposición histórica ni reescribir el historial.
4. **`NEXT_PUBLIC_` seguro.** Solo expone: URLs públicas, IDs de proyecto Sanity, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clave anónima por diseño), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (clave pública del widget) y `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. Ninguna clave privada lleva el prefijo.
5. **Aislamiento servidor.** Todos los módulos que consumen secretos (`lib/supabase/server.ts`, `lib/funnel/email.ts`, `lib/notifications/telegram.ts`, `lib/security/turnstile.ts`, `lib/security/rate-limit.ts`, `lib/funnel/lead.ts`, `lib/admin/auth.ts`) importan `"server-only"`: si un componente cliente los importara, el build falla.

### 🟡 SEC-09 — Secreto huérfano de Google Sheets aún activo (Medio) — REQUIERE TU DECISIÓN

- **Dónde:** `.env.local` define `GOOGLE_SHEETS_WEBHOOK_URL` y `GOOGLE_SHEETS_WEBHOOK_SECRET`. **Ningún archivo del código los referencia** (la persistencia migró a Supabase).
- **Riesgo:** La URL del Apps Script es un *capability URL*: cualquiera que la conozca puede escribir en la hoja (Apps Script no valida origen). Si el deployment sigue activo y la URL se filtró alguna vez (logs, compartida, Vercel), la hoja es escribible por terceros. **No he mostrado el valor ni lo he borrado** (regla de la auditoría).
- **Acción requerida (solo tú puedes hacerla):**
  1. Abre el proyecto de Apps Script → *Implementar* → **archivar/eliminar el deployment** (o añade en el script la verificación del secreto compartido si quieres conservarlo).
  2. Borra ambas variables de `.env.local` y de Vercel (si existen allí).
  3. Si la URL llegó a estar en logs de Vercel u otros sistemas, considera cerrada la hoja y exporta los datos.

### 🟢 SEC-10 — Chat ID real en `.env.example` (Bajo) — CORREGIDO

- El "ejemplo" de `TELEGRAM_CHAT_ID` era un identificador real de canal interno. No es una credencial, pero filtra información. Sustituido por placeholder `-100xxxxxxxxxx`.

### 🟢 SEC-11 — Inconsistencia de nombres de variable Supabase (Bajo)

- `.env.local` define `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, pero el código usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`lib/supabase/client.ts:4`). Además, `lib/supabase/client.ts` (cliente de navegador) es **código muerto**: ningún archivo lo importa. Sin impacto de seguridad (la anon key es pública por diseño), pero conviene alinear nombres o eliminar el archivo. → *Lista en "Decisiones".*

---

## FASE 2 — Validación de Inputs y Sanitización

### Verificaciones superadas ✅

1. **Validación 100% en servidor.** `/api/contact` y `/api/funnel` re-ejecutan esquemas Zod (`lib/portfolio/contact-schema.ts`, `lib/funnel/schema.ts`) sobre el payload crudo: la validación de react-hook-form del cliente es solo UX; un atacante que salte el cliente recibe el mismo contrato.
2. **Límites de longitud.** Campos libres acotados (`descripcion` ≤ 2000, `situacionDetalle` ≤ 500, `message` ≤ 2000, nombre ≤ 80) **más** límite de tamaño de body: `MAX_BODY_BYTES = 32_000` en ambas rutas (doble check: header `content-length` y longitud del texto leído).
3. **Inyección de fórmulas (CWE-1236).** `lib/security/sanitize.ts` neutraliza prefijos `= + - @ \t \r | %` anteponiendo comilla simple, aplicado en `normalizeText()` (`lib/funnel/lead.ts:49`) y directamente en `/api/contact` antes de persistir en Supabase o enviar a Telegram/email.
4. **Validación robusta de email/teléfono.** Email: Zod `.email()` + máx 320. Teléfono: regex `/^[+0-9\s().-]{6,30}$/` en servidor (`lib/funnel/schema.ts:73`), sincronizada con el cliente. Los campos tipo `enum` (situación, tipo, presupuesto…) solo aceptan IDs de la lista blanca.
5. **Defensa en profundidad en ambas rutas:** verificación de `Origin`/`Referer` (`hasTrustedOrigin`), `Content-Type: application/json` obligatorio, honeypot `company` con respuesta fingida 200, y RGPD `consent === true`.
6. **Turnstile verificado en servidor** (`/api/funnel`): token contra `siteverify` de Cloudflare con `idempotency_key` + `remoteip`. Sin token válido → 403.
7. **Escapado de salida.** HTML de emails con `escapeHtml()` (`lib/funnel/email.ts:19`) y `escapeTelegramHtml()`; sin interpolación cruda de input de usuario en HTML.

### 🟢 Nota informativa

- `/api/contact` no usa Turnstile (solo `/api/funnel`). Mitigado con rate limit 3/h/IP + honeypot + origin check. Aceptable para un formulario simple de home; añadir Turnstile sería refuerzo opcional.

---

## FASE 3 — Rate Limiting y Abuso

### Estado: implementado y verificado ✅ (trade-off documentado)

- **Ambas rutas** (`/api/contact`, `/api/funnel`) usan `checkRateLimitUpstash()` (`lib/security/rate-limit.ts`): ventana deslizante **3 peticiones / 60 min por IP** vía Upstash Redis (`@upstash/ratelimit`).
- **`UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` están definidas en `.env.local`** → el path distribuido es el primario. ⚠️ Verifica que también estén en **Vercel Production** (no puedo verlo desde el repo).
- **Trade-off (ya resuelto, solo documentar):** el fallback en memoria (`Map` por proceso) es efímero en serverless — cada instancia Lambda tiene su propia memoria y las invocaciones frías la pierden. **No sirve como límite real**, solo como red de desarrollo. Con Upstash configurado el límite es global y persistente. Si algún día se elimina Upstash, el rate limiting efectivo desaparecería silenciosamente (solo un `console.warn` lo delata) — considera alertar sobre ese warning en logs.
- La IP del cliente se toma de `x-real-ip` → `x-vercel-forwarded-for` → `x-forwarded-for` (`lib/security/request.ts`). En Vercel estas cabeceras las fija la plataforma (no son spoofeables por el cliente), por lo que el bucketing por IP es fiable en este hosting.

---

## FASE 4 — Cabeceras de Seguridad y CSP

### Estado: configurado y verificado ✅ (`next.config.ts`)

| Cabecera | Valor | Estado |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'`, script/style/img/font/connect/frame-src detallados, `frame-ancestors 'none'`, `upgrade-insecure-requests` (prod) | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` | ✅ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (prod) | ✅ |
| `Cross-Origin-Opener-Policy` / `Resource-Policy` | `same-origin` / `same-site` | ✅ |
| `poweredByHeader` | `false` (sin `X-Powered-By`) | ✅ |

**Inventario de terceros verificado contra el CSP** (todos cubiertos):

| Servicio | Directivas |
|---|---|
| Cal.com (embed) | `script-src`/`frame-src`/`connect-src https://app.cal.com` |
| Clerk (auth) | `*.clerk.accounts.dev`, `clerk.xync.es`, `*.clerk.com` en script/connect/frame + `img.clerk.com` en img-src |
| Cloudflare Turnstile | `challenges.cloudflare.com` en script/frame |
| Vercel Analytics + Speed Insights | `va.vercel-scripts.com` |
| Sanity CMS | `*.api.sanity.io`, `*.apicdn.sanity.io`, `cdn.sanity.io` |
| Supabase | `*.supabase.co` + WSS en connect-src |

### 🟢 SEC-12 — `script-src 'unsafe-inline'` (Bajo, riesgo aceptado)

- Next.js inyecta scripts inline de hidratación y framer-motion escribe estilos inline; eliminar `unsafe-inline` exige CSP con nonce vía middleware y renuncia a la optimización estática de muchas páginas. **Recomendación:** mantenerlo hoy; como mejora futura, migrar a nonce + `strict-dynamic`. No aplicado para no romper el sitio (regla de la auditoría).
- Cloudflare está en *DNS only* (sin proxy), así que las cabeceras salen de Vercel tal cual las define `next.config.ts` — sin riesgo de que Cloudflare las stripie.

---

## FASE 5 — Dependencias

### `npm audit`: 9 vulnerabilidades (0 críticas · 4 high · 5 moderadas)

| Paquete | Severidad | Aviso | Dónde vive |
|---|---|---|---|
| `adm-zip` <0.6.0 | High | GHSA-xcpc-8h2w-3j85 (zip bomb 4GB) | `@sanity/runtime-cli` → `@sanity/cli` → `sanity` |
| `js-yaml` ≤3.15.0 | High | GHSA-mh29-5h37-fv8m, GHSA-52cp-r559-cp3m, GHSA-5p4m-2wfm-xmqj (prototype pollution / DoS CPU) | `@vercel/frameworks` (dentro de Sanity CLI) |
| `uuid` <11.1.1 | Moderate | GHSA-w5hq-g745-h8pq | `typeid-js` (Sanity CLI) |
| `dompurify` y afines | Moderate | — | Studio de Sanity |

- **Por qué NO se ha aplicado `npm audit fix`:** la única ruta de fix es `--force`, que instalaría `sanity@5.14.1` (un **downgrade** desde 5.31 con cambio mayor) → rompería el Studio y `next-sanity 13`. Per tu instrucción, queda **listado, no aplicado**.
- **Impacto real:** todo vive en tooling de CLI/Studio (build local, migraciones, `/studio`). **Ninguna de estas librerías atiende peticiones públicas** en runtime. Riesgo residual bajo.
- **Core actualizado y mantenido:** Next 16.3.0, React 19.2.4, Clerk 7.7.8, Supabase 2.112, Zod 4, framer-motion 12, Tailwind 4. Sin dependencias abandonadas en `package.json`.

---

## FASE 6 — Rutas y Middleware

### Verificaciones superadas ✅

1. **`proxy.ts` (middleware de Next 16)** solo monta `clerkMiddleware()`; las rutas son públicas por defecto y la autorización real vive en el servidor, no en el proxy. **El bloqueo de `/admin` NO es solo visual.**
2. **`requireAdmin()` es fail-closed y devuelve 404 real:** `lib/admin/auth.ts:43` → sin sesión → `notFound()`; email fuera de `ADMIN_EMAILS` → `notFound()` (HTTP 404 genuino, indistinguible de una ruta inexistente). Si `ADMIN_EMAILS` está vacío → **deniega** y loguea error (el fail-open histórico SEC-01 está corregido y verificado).
3. **Cobertura completa:** las 4 páginas admin (`/admin`, `/admin/leads`, `/admin/leads/[id]`, y `generateMetadata` de detalle) y las 3 Server Actions de `app/admin/actions.ts` llaman a `requireAdmin()` antes de tocar Supabase. Ningún dato de leads llega al cliente sin autorización.
4. **`/admin/login`:** usuarios autenticados sin permiso ven pantalla de "acceso restringido" (sin revelar configuración); el formulario de Clerk solo aparece sin sesión. `noindex` + disallow en robots.
5. **Sin endpoints huérfanos:** solo existen `/api/contact`, `/api/funnel`, `/api/draft`, `/api/draft/disable`, `/api/revalidate/sanity` y `/rss.xml` — todos con función real. El mock `/api/funnel/lead` eliminado en la auditoría anterior está confirmado como borrado.
6. **Secretos de endpoints bien guardados:** `/api/draft` compara el secreto con `crypto.timingSafeEqual` y restringe el redirect a `/blog*` (sin open redirect); `/api/revalidate/sanity` valida firma HMAC con `parseBody` de `next-sanity/webhook`. Sin secreto configurado → 503/401 (fail-closed).

### 🟢 Nota informativa

- `/studio` (Sanity Studio) es accesible públicamente, pero la autenticación la impone la propia cuenta de Sanity para escribir, y `robots.ts` lo bloquea. Práctica estándar; opcionalmente podría ocultarse tras Clerk si quieres stealth total.

---

## FASE 7 — Exposición de Información

1. **Mensajes de error genéricos** en las 4 API routes: nunca se filtran stack traces, rutas de servidor ni mensajes de Supabase/Resend al cliente (los detalles van solo a `console.*` del servidor, visibles en logs de Vercel). ✅
2. **`app/error.tsx`** muestra mensaje genérico; el digest no se renderiza. ✅
3. **Sin comentarios con datos sensibles:** búsqueda de TODO/FIXME/NOTA junto a términos clave/secret/token/credencial → 0 resultados. ✅
4. **`robots.ts`** bloquea `/admin`, `/admin/login`, `/studio`, `/api/`, `/auth/`, `/login`, `/sign-in`, `/sign-up` para todos los crawlers (incluye sección explícita para bots de IA permitiendo solo el contenido público). **`sitemap.ts`** solo incluye rutas públicas (home, servicios, proyectos, blog, landing, legales). ✅

### 🟢 SEC-13 — `SANITY_REVALIDATE_SECRET` ausente en `.env.local` (Bajo, funcional)

- Sin esta variable, `/api/revalidate/sanity` responde 503 y `/api/draft` responde 401 siempre: **comportamiento fail-closed (seguro)**, pero el webhook de revalidación y el Draft Mode no funcionan en local. Verifica que esté configurada en Vercel Production o el blog no se revalidará al publicar. → *Lista en "Decisiones".*

---

## FASE 8 — Terceros

1. **Google Sheets / Apps Script:** fuera del runtime (Supabase es la fuente de verdad). El webhook legado aún activo se trata en **SEC-09** (🟡, requiere tu acción). Si en el futuro se reactiva: el Apps Script debe verificar un secreto compartido en el body (Apps Script no puede validar origen por sí mismo).
2. **Resend:** llamada solo desde servidor (`lib/funnel/email.ts`, `import "server-only"`), `Idempotency-Key` por lead, timeouts de 10s. **Recomendación de permisos:** usa una API key con scope *Sending access* únicamente (sin dominios/audiences) — verificación manual en el dashboard de Resend, no auditable desde el repo.
3. **Cal.com:** embed oficial `@calcom/embed-react` con `calOrigin: https://app.cal.com`; no transmite cookies de sesión ni datos del lead hacia Cal.com (solo el evento de reserva).
4. **Turnstile:** verificación server-side con idempotencia y `remoteip`; la secret key nunca sale del servidor. ✅
5. **Telegram:** token solo en servidor, HTML escapado, y `sanitizeSecrets()` que redacta el propio token de los mensajes antes de enviarlos. ✅

---

## Correcciones Aplicadas Automáticamente (esta pasada)

| # | Archivo | Cambio | Motivo |
|---|---|---|---|
| 1 | `.env.example` | Chat ID real de Telegram sustituido por placeholder `-100xxxxxxxxxx` | No filtrar identificadores internos en un archivo versionado |
| 2 | `.github/dependabot.yml` | **Nuevo:** Dependabot weekly (npm + github-actions), agrupando minor/patch | Parcheo continuo de dependencias |
| 3 | `.github/workflows/security-audit.yml` | **Nuevo:** `npm audit --omit=dev` semanal + en PRs que toquen locks (umbral `critical` hasta que Sanity parchee; subir a `high` después) | Detectar CVEs nuevas en CI |

**Verificado sin cambios (ya correcto):** `lib/admin/auth.ts` (fail-closed + 404), `lib/security/*` (sanitize, rate-limit, turnstile, request, response), `app/api/contact/route.ts`, `app/api/funnel/route.ts`, `app/api/draft/route.ts`, `next.config.ts` (CSP/headers), `app/robots.ts`, `app/sitemap.ts`, `proxy.ts`, `.gitignore`.

---

## Decisiones que Requieren Tu Confirmación

### 1. 🟡 Revocar el webhook de Google Sheets (SEC-09)
**Qué:** archivar el deployment de Apps Script y borrar `GOOGLE_SHEETS_WEBHOOK_URL`/`GOOGLE_SHEETS_WEBHOOK_SECRET` de `.env.local` (y de Vercel si están).
**Por qué no lo he tocado:** el deployment vive en tu cuenta de Google y borrar variables de tu `.env.local` local sin confirmación viola la regla de no eliminar secretos. **Riesgo si no se hace:** la hoja sigue siendo escribible por cualquiera que conozca la URL.

### 2. 🟡 Vulnerabilidades high transitivas de Sanity (SEC-07)
**Qué:** esperar a que Sanity publique fix upstream (recomendado — solo afecta a CLI/Studio) o planificar upgrade mayor con test del Studio.
**Por qué no lo he tocado:** el único fix disponible es un downgrade breaking (`sanity@5.14.1`). Rompería el CMS por vulnerabilidades que no afectan al runtime público. El workflow de CI avisará si aparece algo crítico nuevo.

### 3. 🟢 Configurar `SANITY_REVALIDATE_SECRET` (SEC-13)
**Qué:** añadirla a `.env.local` y confirmar que existe en Vercel Production. **Impacto de no hacerlo:** Draft Mode y revalidación por webhook no funcionan (el blog solo se actualiza con redeploy o por la ventana horaria de ISR).

### 4. 🟢 Eliminar código muerto de Supabase browser (SEC-11)
**Qué:** borrar `lib/supabase/client.ts` y alinear el nombre de variable (`NEXT_PUBLIC_SUPABASE_ANON_KEY` vs `PUBLISHABLE_KEY`) en `.env.local`.
**Por qué no lo he tocado:** es cero riesgo de seguridad (anon key es pública), y quizá tengas planes para ese cliente. Confirmas y lo limpio en 1 minuto.

### 5. 🟢 (Opcional, futuro) CSP con nonce
**Qué:** eliminar `unsafe-inline` de `script-src` con CSP por nonce en `proxy.ts`.
**Trade-off:** exige renderizado dinámico (adiós a gran parte de la optimización estática), más superficie de error. Recomendado solo si un pentest futuro lo exige.

---

## Recomendaciones para Monitoreo Continuo

1. **Dependabot** — ✅ activado con esta auditoría (`.github/dependabot.yml`). Revisa los PRs semanales los lunes.
2. **`npm audit` en CI** — ✅ activado (`.github/workflows/security-audit.yml`). **Acción pendiente tuya:** cuando Sanity parchee `adm-zip`/`js-yaml`, sube el umbral de `critical` a `high` en el workflow.
3. **GitHub Secret Scanning + Push Protection** — actívalo en Settings → Code security (no configurable desde el repo). Bloquea pushes con tokens.
4. **Alertas de logs:** crea una alerta en Vercel para el warning `[rate-limit] Upstash not configured` — es la señal de que el rate limiting distribuido ha dejado de funcionar silenciosamente.
5. **Rotación trimestral** de: `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TURNSTILE_SECRET_KEY`, `SANITY_REVALIDATE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`. (Sin hallazgos en el historial de git, no hay que rotar por exposición pasada.)
6. **Re-auditoría** tras cualquier cambio de stack (nueva integración de terceros = nueva entrada en CSP + revisión de esta lista).

---

*Auditoría realizada el 2026-08-21. Este documento sustituye a la versión del 2026-08-20, cuyas 8 correcciones (SEC-01…SEC-08) fueron verificadas individualmente contra el código y confirmadas como aplicadas.*
