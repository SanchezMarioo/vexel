# Landing de servicios freelance — guía para rellenarla

Esta landing es la **home** del sitio (`/`), orientada a **clientes no técnicos**
(fundadores, PMs, dueños de negocio). Cada sección responde, en orden, a:
¿puede resolver mi problema? → ¿puedo confiar? → ¿cómo lo contrato?

El portal de clientes (`/cuenta`, `/admin`, `/auth`) sigue funcionando igual.

Diseño: base clara, color de marca violeta `#7b61ff` (en OKLCH), estrategia
*committed-restrained* (el violeta solo como acento con propósito). Tipografía
*Bricolage Grotesque* + *Geist* (cuerpo). Todo bajo `.pf-root`.

## 1. Texto — casi todo en un sitio

Edita [`lib/portfolio/content.ts`](lib/portfolio/content.ts). El copy de servicios,
proceso y FAQ ya es real y orientado al cliente; **lo que va entre `[CORCHETES]` son
tus datos personales/de clientes** a sustituir:

- **`identity`** — nombre, `headline` (qué haces y para quién), `subhead` (el problema
  del cliente), disponibilidad, tiempo de respuesta, email, **`calendlyUrl`** y redes.
- **`services`** — 3 servicios (problema → `result` → `audience`). Ya redactados; ajústalos a tu realidad.
- **`processSteps`** — "Cómo trabajo" desde el cliente: `you` (qué hace él) / `me` (qué haces tú) / `when`.
- **`projects`** — 3 casos con `sector / problem / built / result`. **Rellena con casos reales.**
- **`testimonials`** — citas sobre resultados concretos. **Pide a clientes reales.**
- **`faqs`** — objeciones (plazos, precio, revisiones, comunicación, garantía). Ya redactadas.

Los títulos de sección viven en los componentes (`components/portfolio/*.tsx`).

## 2. Imágenes

Hay marcos-placeholder ([`ImageSlot`](components/portfolio/ui/ImageSlot.tsx)) en el
hero y en cada proyecto, con el aspect-ratio correcto. Para las reales:

1. Guarda la captura en `public/portfolio/` (p.ej. `proyecto-1.jpg`, `1600×1000`;
   `hero.jpg`, `1200×820`) y actualiza `src/alt/width/height` en `content.ts`.
2. En [`Hero.tsx`](components/portfolio/Hero.tsx) y [`Projects.tsx`](components/portfolio/Projects.tsx)
   sustituye `<ImageSlot image={...} />` por `<Image>` de `next/image`:

   ```tsx
   import Image from "next/image";
   <Image src={p.image.src} alt={p.image.alt} width={p.image.width}
     height={p.image.height} className="h-full w-full object-cover" />
   ```

`next.config.ts` ya permite imágenes locales y de `images.unsplash.com`.

## 3. Contacto

- **Calendly**: pon tu enlace real en `identity.calendlyUrl`.
- **Formulario** (3 campos: nombre, email, mensaje) valida con Zod
  ([`contact-schema.ts`](lib/portfolio/contact-schema.ts)) y envía a
  [`/api/contact`](app/api/contact/route.ts) (rate-limit + honeypot).
- **Falta conectar la entrega**: hoy valida y registra en el log del servidor. Elige y
  reemplaza el `TODO` del route: **Resend** (email) o **Supabase** (tabla
  `contact_messages` vía [`lib/supabase/admin.ts`](lib/supabase/admin.ts)).

## 4. Notas técnicas

- **Tipografías** con `next/font` (self-host), cargan bajo la CSP. Sin `@import` externos.
- **Tailwind v4**: tokens en `@theme` de [`app/globals.css`](app/globals.css) (prefijo
  `--color-pf-*`). No hay `tailwind.config.ts`.
- **Reduced motion** respetado en todas las animaciones.
- SEO/JSON-LD (`Person` + `ProfessionalService`) y metadatos en
  [`app/page.tsx`](app/page.tsx); revisa `NEXT_PUBLIC_SITE_URL`.
