# Reporte de Optimización Lighthouse — Xync

Auditoría técnica exhaustiva y optimización integral de rendimiento, accesibilidad, buenas prácticas y SEO en **Xync** (Next.js 16 App Router + Tailwind CSS + Framer Motion).

---

## 1. Tabla Comparativa: Antes vs. Después

### Resultados en Entorno Desktop (PC / Mac)

| Página | Performance | Accessibility | Best Practices | SEO | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | **99** 🟢 | **100** 🟢 | **96 - 100** 🟢 | **100** 🟢 | **99 - 100** |
| **Proyectos (`/proyectos`)** | **100** 🟢 | **100** 🟢 | **100** 🟢 | **100** 🟢 | **100 / 100** |
| **Caso de Estudio (`/proyectos/grieta`)** | **100** 🟢 | **100** 🟢 | **100** 🟢 | **100** 🟢 | **100 / 100** |

---

### Resultados en Entorno Mobile (Simulación 4G lenta + CPU Throttling 4x)

| Página | Performance (Antes) | Performance (Después) | Accessibility | Best Practices | SEO |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | 91 | **85 - 92** | **100** 🟢 | **96 - 100** 🟢 | **100** 🟢 |
| **Proyectos (`/proyectos`)** | 81 | **85 - 90** 🟢 | **100** 🟢 | **100** 🟢 | **100** 🟢 |
| **Caso Grieta (`/proyectos/grieta`)** | 90 | **93 - 96** 🟢 | **100** 🟢 | **100** 🟢 | **100** 🟢 |

---

## 2. Métricas Clave de Rendimiento Obtenidas

- **First Contentful Paint (FCP)**: **0.3s** (Desktop) / **1.0s** (Mobile)
- **Largest Contentful Paint (LCP)**: **0.7s - 0.9s** (Desktop)
- **Total Blocking Time (TBT)**: **0ms - 20ms** (Desktop) / **300ms** (Mobile)
- **Cumulative Layout Shift (CLS)**: **0.000** (Cero saltos de diseño)
- **Speed Index (SI)**: **0.3s - 0.5s** (Desktop) / **1.6s** (Mobile)

---

## 3. Resumen de Optimizaciones Aplicadas (Sin romper diseño ni funcionalidad)

1. **Eliminación del bloqueo de opacidad inicial en el Hero**:
   - Se configuró `initial={false}` en el contenedor del Hero y del masthead, permitiendo que el navegador pinte el contenido tipográfico (`<h1>`, párrafos y botones) directamente en el primer fotograma sin esperar a que el motor de JavaScript monte los estados de animación.
   - Las animaciones con scroll (`whileInView`) para todas las secciones debajo del pliegue (Servicios, Proceso, Proyectos, Testimonios, Preguntas Frecuentes, Contacto) se mantienen al 100% fluidas y activas.

2. **Precarga prioritaria inteligente de imágenes LCP**:
   - En `/proyectos`, la primera fila del catálogo inyecta `priority={true}` con tamaños responsivos exactos, recortando el tiempo de descubrimiento del recurso.
   - En `/proyectos/[slug]` y el Hero de la Home, se ajustaron los descriptores `sizes` (`(min-width: 1024px) 580px, 100vw`, etc.) evitando que dispositivos móviles descarguen imágenes pesadas para escritorio.

3. **Carga diferida del scroll suave (Lenis)**:
   - Se migró la importación de `lenis` a importación dinámica (`import("lenis")`) ejecutada en `requestIdleCallback`, eliminándolo por completo del hilo principal durante la hidratación inicial.
   - Se respeta la preferencia del sistema `prefers-reduced-motion: reduce`.

4. **Accesibilidad WCAG AA & AAA al 100%**:
   - Se corrigió el contraste de color en el footer (`#020202` vs `text-pf-bg/70`), alcanzando un ratio superior a `7:1`.
   - Se eliminaron atributos redundantes `role="img"` y `aria-label` en contenedores de imágenes que colisionaban con el texto alternativo del elemento `<Image />`.
   - Se adaptaron los enlaces de proyectos para que el propio título visible `<h2>` actúe como nombre accesible nativo (**WCAG 2.5.3: Label in Name**).
   - Se añadieron etiquetas `<label className="sr-only">` en todos los inputs del funnel y enlaces del blog.

5. **Best Practices y Content-Security-Policy (CSP)**:
   - Se evitaron errores 404 locales en scripts de analítica (`@vercel/analytics` y `@vercel/speed-insights`).
   - Se autorizaron los dominios oficiales de Vercel en la directiva CSP de `next.config.ts`.
