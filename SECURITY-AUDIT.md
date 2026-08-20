# Auditoría de Seguridad Integral — Xync

**Proyecto:** Xync (Estudio Digital) · https://www.xync.es  
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Supabase + Clerk + Resend + Cloudflare Turnstile  
**Fecha:** 2026-08-20  
**Estado:** ✅ Auditoría completada y correcciones críticas aplicadas en código  

---

## Resumen Ejecutivo de Hallazgos

| ID | Fase | Descripción del Hallazgo | Severidad | Estado |
|---|---|---|---|---|
| **SEC-01** | Fase 6 | Autorización *Fail-Open* en `checkIsAdmin`: acceso irrestricto si `ADMIN_EMAILS` no estaba configurado | 🔴 **Crítico** | **Corregido** |
| **SEC-02** | Fase 2 | Riesgo de inyección de fórmulas en hojas de cálculo (CWE-1236 / CSV Injection) en campos de texto libre | 🟡 **Medio** | **Corregido** |
| **SEC-03** | Fase 3 | Falta de límite de tamaño de payload (`MAX_BODY_BYTES`) y rate limit en memoria en `/api/contact` | 🟡 **Medio** | **Corregido** |
| **SEC-04** | Fase 2 | Discrepancia en validación de formato de teléfono entre cliente (regex) y servidor (solo longitud) | 🟡 **Medio** | **Corregido** |
| **SEC-05** | Fase 6 | Endpoint de pruebas huérfano con almacenamiento en memoria (`app/api/funnel/lead/route.ts`) | 🟡 **Medio** | **Eliminado** |
| **SEC-06** | Fase 7 | Comparación de secreto de Draft Mode vulnerable a ataques de canal lateral (*timing attacks*) | 🟢 **Bajo** | **Corregido** |
| **SEC-07** | Fase 5 | Vulnerabilidades transitivas en subdependencias de Sanity (`nanoid`, `adm-zip`, `js-yaml`, `uuid`, `dompurify`) | 🟡 **Medio** | **Documentado** |
| **SEC-08** | Fase 4 | CSP y cabeceras de seguridad configuradas y verificadas con todos los servicios de terceros | 🟢 **Bajo** | **Verificado** |

---

## Desglose Detallado por Fase

### FASE 1 — Secretos y Variables de Entorno

1. **Búsqueda de credenciales hardcodeadas en código:**
   - **Resultado:** Ninguna clave privada, token o contraseña se encuentra hardcodeada en el repositorio.
   - Todas las credenciales sensibles (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TURNSTILE_SECRET_KEY`, `SANITY_REVALIDATE_SECRET`, `SANITY_API_WRITE_TOKEN`, `CLERK_SECRET_KEY`) se cargan exclusivamente desde variables de entorno.
2. **Verificación de `.gitignore`:**
   - **Resultado:** `.env`, `.env*.local`, `.env.local`, `.env.development.local`, `.env.test.local` y `.env.production.local` están correctamente excluidos del control de versiones.
3. **Historial de Git (`git log -p`):**
   - **Resultado:** No se encontraron secretos reales commiteados en el historial histórico de Git. Los commits históricos solo contenían plantillas `.env.example` con valores de ejemplo o eliminaciones de referencias antiguas.
4. **Uso de prefijo `NEXT_PUBLIC_`:**
   - **Resultado:** Solo se exponen al cliente variables públicas y seguras:
     - `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` (URL canónica)
     - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Site Key pública del widget de Cloudflare)
     - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (URL de Supabase y clave anónima pública)
     - `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` (Identificadores públicos de Sanity CMS)
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Clave pública de Clerk)
   - **Ninguna clave privada tiene el prefijo `NEXT_PUBLIC_`**.
5. **Aislamiento en Server Components y Route Handlers:**
   - Todos los módulos que acceden a secretos sensibles utilizan la directiva `import "server-only";` (`lib/supabase/server.ts`, `lib/funnel/email.ts`, `lib/notifications/telegram.ts`, `lib/security/turnstile.ts`, `lib/admin/auth.ts`, `lib/security/rate-limit.ts`, `lib/funnel/deliver.ts`). Cualquier intento de importar estos módulos en un componente cliente (`"use client"`) provoca un fallo de compilación en tiempo de *build*.

---

### FASE 2 — Validación de Inputs y Sanitización

1. **Rutas de API (`/api/contact` y `/api/funnel`):**
   - **Validación del servidor:** Ambas rutas validan el 100% de los datos recibidos mediante esquemas Zod en el servidor (`contactSchema` y `funnelSchema`), rechazando cualquier payload alterado o que eluda la validación del cliente.
   - **Límite de tamaño de payload:**
     - `/api/funnel`: `MAX_BODY_BYTES = 32_000` (32 KB).
     - `/api/contact`: Añadido límite `MAX_BODY_BYTES = 32_000` (32 KB) para prevenir ataques de denegación de servicio por subida de payloads masivos.
   - **Sanitización contra Inyección de Fórmulas (CWE-1236 / CSV Injection):**
     - Si un usuario ingresa texto que comience por caracteres de fórmula (`=`, `+`, `-`, `@`, `\t`, `\r`, `|`, `%`), un atacante podría ejecutar código o exfiltrar datos si los leads se exportan o visualizan en Microsoft Excel o Google Sheets.
     - **Corrección:** Se implementó `lib/security/sanitize.ts` y se aplicó `sanitizeTextForStorage()` a todos los campos de texto libre (`nombre`, `empresa`, `descripcion`, `situacionDetalle`, `message`) antes de persistir en Supabase o enviar por Telegram/Email.
2. **Formulario multistep (`/empezar`):**
   - **Teléfono:** Se añadió validación en servidor con la expresión regular `/^[+0-9\s().-]{6,30}$/` en `lib/funnel/schema.ts`, sincronizándola con la validación del cliente para impedir la inyección de cadenas arbitrarias.
   - **Nombre:** Restringido a 2-80 caracteres y filtrado contra etiquetas HTML (`/[<>]/.test()`).
   - **Email:** Validado con formato RFC e internacional por Zod con longitud máxima de 320 caracteres.
   - **Honeypot:** El campo oculto `company` descarta silenciosamente los envíos de bots automatizados con respuesta `200 OK` para no alertar al bot.
   - **Cloudflare Turnstile:** El token anti-bot se valida en el servidor contra la API oficial de Cloudflare (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).

---

### FASE 3 — Rate Limiting y Protección contra Abuso

1. **Estado del Rate Limiting:**
   - `/api/funnel`: Utiliza `checkRateLimitUpstash` con ventana deslizante (*sliding window*) de 3 peticiones por 60 minutos por IP.
   - `/api/contact`: Se migró de un `Map` puramente en memoria a `checkRateLimitUpstash` con prefijo `contact:ip:${clientIp}`.
2. **Trade-offs y Arquitectura en Serverless (Vercel):**
   - **Memoria local (Fallback):** En entornos serverless / edge (como Vercel), la memoria en proceso `Map` es efímera y no se comparte entre distintas instancias lambda o regiones. Sirve como protección de desarrollo o contra ráfagas inmediatas en una misma instancia.
   - **Upstash Redis (Producción):** Con las variables `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` configuradas, el límite de peticiones es global, distribuido y persistente en toda la infraestructura de Vercel.

---

### FASE 4 — Cabeceras de Seguridad y Content Security Policy (CSP)

1. **Configuración en `next.config.ts`:**
   - **`Content-Security-Policy`**:
     - `default-src 'self'`
     - `script-src 'self' 'unsafe-inline' https://app.cal.com https://va.vercel-scripts.com https://*.clerk.accounts.dev https://clerk.xync.es https://*.clerk.com https://challenges.cloudflare.com`
     - `style-src 'self' 'unsafe-inline'`
     - `img-src 'self' data: blob: https://images.unsplash.com https://cdn.sanity.io https://img.clerk.com https://images.clerk.dev`
     - `font-src 'self' data:`
     - `connect-src 'self' https://app.cal.com https://va.vercel-scripts.com https://*.api.sanity.io wss://*.api.sanity.io https://*.apicdn.sanity.io https://sanity-cdn.com https://*.sanity-cdn.com https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://clerk.xync.es https://*.clerk.com`
     - `frame-src https://app.cal.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com`
     - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`
   - **`X-Content-Type-Options`**: `nosniff`
   - **`X-Frame-Options`**: `DENY`
   - **`Referrer-Policy`**: `strict-origin-when-cross-origin`
   - **`Permissions-Policy`**: `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`
   - **`Cross-Origin-Opener-Policy`**: `same-origin`
   - **`Cross-Origin-Resource-Policy`**: `same-site`
   - **`Strict-Transport-Security`** (Producción): `max-age=31536000; includeSubDomains; preload`
   - **`poweredByHeader`**: `false` (oculta la cabecera `X-Powered-By: Next.js`)
2. **Inventario de Scripts de Terceros Permitidos:**
   - **Cal.com:** `https://app.cal.com` (Widget de reserva de llamadas)
   - **Vercel Analytics & Speed Insights:** `https://va.vercel-scripts.com`
   - **Clerk Authentication:** `https://*.clerk.accounts.dev`, `https://clerk.xync.es`, `https://*.clerk.com`
   - **Cloudflare Turnstile:** `https://challenges.cloudflare.com`
   - **Sanity CMS:** `https://cdn.sanity.io`, `https://*.api.sanity.io`

---

### FASE 5 — Dependencias y Vulnerabilidades

1. **Auditoría de Dependencias (`pnpm audit` / `npm audit`):**
   - Se detectaron 10 avisos en dependencias transitivas (4 moderadas, 6 altas):
     - `nanoid` (<3.3.18) — GHSA-2v37-7h3g-55p8 (*High*): Bucle potencial con generadores customizados de tamaño cero.
     - `adm-zip` (<0.6.0) — GHSA-xcpc-8h2w-3j85 (*High*): Asignación de memoria en archivos zip manipulados (usado en `@sanity/cli` durante migraciones CLI).
     - `js-yaml` (<3.15.1) — GHSA-h67p-54hq-rp68 / GHSA-5p4m-2wfm-xmqj (*High/Moderate*): Consumo de CPU cuadrático en merge keys (usado en `@vercel/frameworks` dentro de Sanity CLI).
     - `uuid` (<11.1.1) — GHSA-w5hq-g745-h8pq (*Moderate*): Falta de comprobación de límites de búfer.
     - `dompurify` (<=3.4.12) — GHSA-55q2-fjhq-7xh7 (*Moderate*): XSS en hook IN_PLACE en `isomorphic-dompurify`.
2. **Impacto real en el sitio:**
   - Todas estas vulnerabilidades se encuentran en herramientas de línea de comandos de Sanity (`@sanity/cli` y `@sanity/runtime-cli`) o en el Studio interno de CMS (`/studio`), **no en el código que atiende peticiones públicas de visitantes**.
   - No es posible resolverlas con `npm audit fix` estándar sin romper compatibilidad mayor (*breaking changes*) con la versión actual de Sanity Studio.
3. **Estado de librerías principales:**
   - Next.js (`16.3.0`), React (`19.2.4`), Clerk (`^7.7.8`), Supabase (`^2.112.3`), Framer Motion (`^12.38.0`), Zod (`^4.3.6`) se encuentran en versiones actualizadas y mantenidas.

---

### FASE 6 — Rutas, Middleware y Autenticación

1. **Corrección Crítica en `lib/admin/auth.ts`:**
   - **Antes:** `checkIsAdmin` retornaba `true` si `ADMIN_EMAILS` estaba vacío o no definido, provocando un fallo de tipo *Fail-Open* donde cualquier usuario registrado en Clerk podía ver y borrar leads.
   - **Ahora:** Se modificó para ser estrictamente *Fail-Closed*. Si `ADMIN_EMAILS` no está definido o no coincide, el acceso es denegado de forma inmediata (`return false`) y se registra un error en el servidor.
2. **Protección de Rutas `/admin`:**
   - Las páginas `/admin`, `/admin/leads`, `/admin/leads/[id]` y todas las Server Actions de `app/admin/actions.ts` ejecutan `await requireAdmin()` en el **servidor** antes de realizar cualquier lectura o mutación en Supabase.
   - Ningún dato de leads llega jamás al cliente sin autenticación y autorización previa.
3. **Eliminación de Endpoints Huérfanos:**
   - Se eliminó la carpeta `app/api/funnel/lead/` (`route.ts`), la cual contenía un endpoint de pruebas de desarrollo con un `Map` en memoria que no se utilizaba en el proyecto.

---

### FASE 7 — Exposición de Información

1. **Mensajes de Error en APIs:**
   - Las respuestas de error en `/api/contact`, `/api/funnel`, `/api/draft` y `/api/revalidate/sanity` devuelven mensajes genéricos y seguros (`"No pudimos enviar el mensaje"`, `"Datos no válidos"`), sin filtrar nunca trazas de error (*stack traces*), rutas del sistema de archivos o detalles de controladores internos de base de datos.
2. **Protección contra Timing Attacks en `/api/draft`:**
   - Se actualizó la validación del parámetro `secret` para usar `crypto.timingSafeEqual()`, evitando que un atacante pueda deducir el secreto mediante análisis de diferencias en los tiempos de respuesta.
3. **`robots.txt` y `sitemap.xml`:**
   - `app/robots.ts` bloquea explícitamente el rastreo de `/admin`, `/admin/`, `/studio`, `/studio/`, `/api/`, `/auth/`, `/cuenta/`, `/login`, `/sign-in` y `/sign-up`.
   - `app/sitemap.ts` solo incluye páginas públicas indexables (home, proyectos, servicios, blog y landing pages), sin exponer ninguna ruta privada.

---

### FASE 8 — Servicios de Terceros

1. **Google Sheets / Apps Script:**
   - La persistencia principal de leads fue migrada a **Supabase**, eliminando la dependencia del webhook de Apps Script en tiempo de ejecución.
   - El script `scripts/migrate-leads-from-sheets.ts` existe únicamente para migraciones puntuales en local/CLI mediante service role key.
2. **Resend (Email API):**
   - Las llamadas a la API de Resend (`https://api.resend.com/emails`) se ejecutan exclusivamente desde el servidor (`lib/funnel/email.ts`), utilizando `Idempotency-Key` único por lead para evitar duplicados.
3. **Cal.com:**
   - Se utiliza el componente `@calcom/embed-react` cargado dinámicamente con `calOrigin: "https://app.cal.com"`. No se transfieren cookies de sesión ni datos sensibles del usuario en la integración.
4. **Cloudflare Turnstile:**
   - Implementado con clave secreta verificada en servidor. Incluye clave de idempotencia (`crypto.randomUUID()`) y reenvío opcional de la IP del cliente para prevenir ataques de repetición (*replay attacks*).

---

## Modificaciones Realizadas en Código

| Archivo | Cambio Realizado | Motivo de Seguridad |
|---|---|---|
| [`lib/security/sanitize.ts`](file:///c:/Programacion/Proyectos_Web/vexel/lib/security/sanitize.ts) | **Nuevo:** Módulo de sanitización contra CSV/Formula Injection | Prevenir ejecución de fórmulas en hojas de cálculo (CWE-1236) |
| [`lib/admin/auth.ts`](file:///c:/Programacion/Proyectos_Web/vexel/lib/admin/auth.ts) | **Modificado:** `checkIsAdmin` ahora es *fail-closed* | Evitar que usuarios arbitrarios sean administradores si falta `ADMIN_EMAILS` |
| [`lib/funnel/schema.ts`](file:///c:/Programacion/Proyectos_Web/vexel/lib/funnel/schema.ts) | **Modificado:** Añadida validación regex para `telefono` | Paridad de validación estricta cliente-servidor |
| [`lib/funnel/lead.ts`](file:///c:/Programacion/Proyectos_Web/vexel/lib/funnel/lead.ts) | **Modificado:** Integrada sanitización en `normalizeText` | Neutralizar entradas maliciosas en el almacenamiento de leads |
| [`app/api/contact/route.ts`](file:///c:/Programacion/Proyectos_Web/vexel/app/api/contact/route.ts) | **Modificado:** `MAX_BODY_BYTES`, Upstash rate limit y sanitización | Prevenir DoS por payload grande, abuso y formula injection |
| [`app/api/draft/route.ts`](file:///c:/Programacion/Proyectos_Web/vexel/app/api/draft/route.ts) | **Modificado:** Comparación con `crypto.timingSafeEqual` | Proteger secreto de Draft Mode contra timing attacks |
| `app/api/funnel/lead/route.ts` | **Eliminado:** Archivo de mock huérfano | Reducción de superficie de ataque y código muerto |

---

## Decisiones que Requieren Confirmación del Usuario

### 1. Comportamiento de Rutas de Administración: Modo Stealth (404 Not Found) — ✅ APLICADO
- **Implementación:** Cualquier petición no autenticada o de usuarios no autorizados a `/admin`, `/admin/leads` o `/admin/leads/[id]` devuelve inmediatamente `notFound()` (código HTTP 404 real), haciéndola completamente indistinguible de una ruta inexistente ante escáneres o visitantes casuales.
- **Acceso Administrativo:** La ruta `/admin/login` se mantiene activa para el inicio de sesión directo de administradores mediante Clerk, sin enlaces visibles desde el sitio público y excluida de motores de búsqueda en `app/robots.ts`.

### 2. Actualización de Dependencias de Sanity CMS — ✅ APLICADO
- Se actualizaron las dependencias de Sanity a sus versiones más recientes en la rama `chore/sanity-dependencies-upgrade`.

---

## Seguimiento de Actualización de Dependencias de Sanity

### Versiones Anteriores vs Nuevas

| Paquete | Versión Anterior | Versión Nueva | Tipo de Actualización |
|---|---|---|---|
| `sanity` | `5.31.1` | `6.9.2` | Major (v5 → v6) |
| `@sanity/vision` | `5.31.1` | `6.9.2` | Major (v5 → v6) |
| `next-sanity` | `13.2.2` | `13.3.2` | Minor |
| `@sanity/client` (dev) | `7.26.0` | `8.0.0` | Major (v7 → v8) |
| `@sanity/image-url` | `2.1.1` | `2.1.1` | Sin cambios (ya en última versión) |

### Breaking Changes y Resolución
1. **Configuración de Studio (`sanity.config.ts`):** Compatible al 100% con `structureTool()` y `visionTool()`. No requirió cambios en la estructura de esquemas ni plugins.
2. **Esquemas de contenido (`sanity/schemas/`):** Totalmente compatibles con Sanity v6 sin advertencias de deprecación.
3. **Fetching de contenido (`next-sanity` & `sanity/client.ts`):** La API de `createClient` y el manejo de tags de caché ISR (`next: { tags }`) continúan operando sin modificaciones.

### Estado de Vulnerabilidades
- **En producción (`npm audit --omit=dev --audit-level=high`):** 0 vulnerabilidades en tiempo de ejecución del frontend público.
- **En herramientas CLI internas de Sanity (`@sanity/cli`):** Sanity v6 incluye dependencias transitivas fijadas por el ecosistema de Sanity (`@vercel/frameworks` con `js-yaml` y `typeid-js` con `uuid`). Estas vulnerabilidades son exclusivas del entorno CLI de compilación/desarrollo de Sanity y son gestionadas directamente por el equipo upstream de Sanity en sus próximos lanzamientos de mantenimiento.

### Verificación de Funcionamiento
- **Compilación de Producción:** `npm run build` completado exitosamente (código 0, 46 rutas generadas).
- **Studio Embebido (`/studio`):** Verificado vía HTTP (`200 OK`) — carga de la interfaz de Studio operativa.
- **Contenido Público (Blog, Proyectos, Servicios):** Verificado vía HTTP (`200 OK` en `/blog`, `/blog/[slug]`, `/proyectos`, `/`).

---

## Recomendaciones para Monitoreo Continuo

1. **GitHub Dependabot / Renovate:**
   - Activar Dependabot Alerts y Version Updates en el repositorio de GitHub (`.github/dependabot.yml`) para recibir parches automáticos de dependencias vulnerables.
2. **GitHub Secret Scanning & Push Protection:**
   - Activar *Push Protection* en los ajustes de seguridad del repositorio de GitHub para bloquear automáticamente cualquier `git push` accidental que contenga tokens o claves API.
3. **Auditoría Automatizada en CI/CD:**
   - Añadir un paso de `pnpm audit --prod` o `npm audit --omit=dev --audit-level=high` en la pipeline de GitHub Actions para alertar ante nuevas CVEs en dependencias de producción.
4. **Rotación Periódica de Credenciales:**
   - Establecer un recordatorio trimestral para rotar tokens como `SANITY_REVALIDATE_SECRET`, `TELEGRAM_BOT_TOKEN` y `RESEND_API_KEY`.
