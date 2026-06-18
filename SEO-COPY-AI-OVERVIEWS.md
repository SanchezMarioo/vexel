# SEO-COPY-AI-OVERVIEWS — Citabilidad en IA + E-E-A-T (FASES 4 y 6)

Objetivo: que Xync aparezca cuando alguien pregunte a ChatGPT/Gemini/Perplexity
*"¿quién me puede hacer la web de mi restaurante en Salamanca?"* — y que Google
tenga texto extraíble para AI Overviews. Todo en **es-ES**.

---

## 1. Cómo decide la IA a quién citar (y qué te falta)

Los motores generativos citan **entidades que pueden corroborar** en varias fuentes y de las
que encuentran **pasajes auto-contenidos** que responden la pregunta. Hoy Xync falla en las dos:

- **Entidad débil:** fuera de la web, "Xync" casi no existe (solo Discord). Sin GBP, LinkedIn,
  GitHub ni directorios, la IA no tiene cómo confirmar que es un negocio real de Salamanca.
- **Pasajes poco citables:** el copy actual es excelente para conversión (frases cortas, punchy)
  pero **no auto-contenido**: párrafos de 1-2 líneas que no nombran la entidad ni el lugar, así
  que aislados no responden nada. La IA necesita 130-170 palabras que se sostengan solas.

**Las dos palancas, por orden:** (1) construir la entidad externa; (2) reescribir/añadir pasajes
citables. Sin la 1, la 2 rinde poco.

---

## 2. Title y description (FASE 1 + intención local)

**Home (`app/page.tsx`):**
- `title` → `Desarrollador web freelance en Salamanca | Xync` *(47 car.)*
- `description` → `Desarrollo y mejoro webs, tiendas online y productos digitales en Salamanca y toda España: rápido, sin fallos y con precio y plazo cerrados. Te respondo en menos de 24 h.` *(~150 car.)*

**Default del sitio (`app/layout.tsx`):** mantén la marca pero añade ancla local en el template,
p. ej. `template: "%s | Xync · Desarrollo web en Salamanca"`.

**Página `/landing-pages-negocios-locales`** (además de corregir acentos):
- `title` → `Landing pages que convierten para negocios | Xync (Salamanca)`

> Regla: no metas Salamanca a la fuerza en todas las páginas; sí en home, contacto y páginas de
> servicio local. El blog (cluster problema) puede ser nacional.

---

## 3. Encabezados en formato pregunta (FASE 4 + 6)

Los `<h2>`/`<h3>` actuales son afirmaciones de marca. Mantén el tono, pero **convierte algunos en
las preguntas que el cliente teclea/pregunta**, porque son las que la IA empareja:

| Sección | Actual | Propuesto (pregunta real) |
|---|---|---|
| Services | "¿Qué necesitas resolver?" | ✅ ya es pregunta — mantener |
| Process | "Cómo trabajamos juntos" | "¿Cómo es trabajar con Xync, paso a paso?" |
| Projects | "Casos reales, no solo capturas" | "¿Qué resultados he conseguido para negocios reales?" |
| Testimonials | *(sin h2)* | **Añadir h2:** "¿Qué dicen los negocios con los que he trabajado?" |
| Contact | "Cuéntame qué quieres construir." | mantener (es CTA, no consulta) |

En la página de servicio y el blog, usa H2 = pregunta literal del cluster: *"¿Cuánto cuesta una
página web en Salamanca?"*, *"¿Cuánto se tarda en hacer una web?"*, *"¿Por qué mi web no convierte?"*.

---

## 4. Pasajes citables listos para usar (134-167 palabras, verificados)

Añádelos como contenido visible (no solo schema). Cada uno **nombra la entidad (Xync), el lugar
(Salamanca) y un dato concreto** (precio, plazo, proyecto) → se sostiene solo si la IA lo extrae.

### 4.1 · Bloque "Quién es Xync" (para un `<section id="sobre-xync">` u "Sobre mí") — 143 palabras
> Xync es un desarrollador web freelance con base en Salamanca que diseña y construye webs,
> tiendas online y productos digitales para negocios de Castilla y León y de toda España. A
> diferencia de una agencia tradicional, Xync trabaja con precio y plazo cerrados antes de empezar:
> sabes cuánto cuesta y cuándo lo tienes, sin sorpresas ni facturación por horas. El enfoque es
> doble, de conversión y de rendimiento: cada página guía al visitante hacia una única acción de
> valor —pedir presupuesto, reservar o comprar— y carga rápido en móvil para posicionar en Google.
> Entre sus proyectos reales están la tienda online Grieta, el periódico digital The Byte y la web
> del restaurante Lumière, los tres en producción. Xync responde a cualquier consulta en menos de
> 24 horas y atiende tanto a clientes locales de Salamanca como en remoto a toda España y Latinoamérica.

### 4.2 · Respuesta "¿Cuánto cuesta una página web en Salamanca?" — 144 palabras
> Una página web profesional con Xync parte desde 1.200 € y el precio se cierra antes de empezar,
> no se factura por horas. El importe final depende del número de secciones, las integraciones
> (reservas, pagos, formularios) y si necesitas tienda online. Un proyecto estándar incluye
> estrategia de mensaje, diseño a medida, desarrollo, copy orientado a conversión, optimización de
> velocidad para móvil y una ronda de ajustes tras la entrega. El plazo medio es de dos a cuatro
> semanas, acordado por escrito en la propuesta. Para negocios de Salamanca y Castilla y León, Xync
> ofrece una primera llamada de diagnóstico sin coste donde se define el alcance y se da un precio
> cerrado en 48 horas. Esto elimina la incertidumbre típica de los presupuestos abiertos: el cliente
> sabe exactamente qué recibe, cuánto paga y cuándo estará publicada su web antes de comprometer un solo euro.

### 4.3 · Respuesta "¿Por qué mi web no convierte?" (para blog → spoke problema) — 146 palabras
> Si tu web recibe visitas pero no genera contactos ni ventas, el problema casi nunca es el tráfico:
> es la página. Las webs de negocio que no convierten suelen repetir los mismos fallos: un mensaje
> confuso en el primer bloque, demasiadas opciones que dispersan al visitante, llamadas a la acción
> débiles y una carga lenta en móvil que hace abandonar antes de leer. La solución es estructurar la
> página alrededor de una sola acción de valor y eliminar todo lo que no ayude a esa decisión. En
> Xync, desarrollador web en Salamanca, cada proyecto parte de esa lógica de conversión: jerarquía
> de mensaje clara, velocidad optimizada y un CTA visible desde el primer scroll. El resultado
> medible es más contactos cualificados con el mismo tráfico y un menor coste por lead en campañas.
> Antes de invertir más en anuncios, conviene arreglar la página que los recibe.

> Las FAQ existentes en `lib/content/faqs.ts` ya están bien construidas para esto (auto-contenidas,
> nombran a Xync, dan cifras). Reúsalas en la home/servicio como contenido visible.

---

## 5. Señales E-E-A-T a reforzar (FASE 4)

| Señal | Estado | Acción |
|---|---|---|
| **Experience** (proyectos reales) | 🟢 Fuerte | Grieta/The Byte/Lumière en vivo. Añade captura propia de cada uno y, si puedes, una métrica ("+30% reservas entre semana"). |
| **Expertise** (conocimiento técnico) | 🟡 | `knowsAbout` en schema (hecho) + una línea de stack (Next.js/React) en "Sobre Xync". |
| **Authoritativeness** (entidad) | 🔴 Débil | GBP + LinkedIn + GitHub + 3-5 directorios. Ver §6. |
| **Trust** (confianza) | 🟡 | Precio/plazo cerrados ✅. Faltan: **páginas legales** (P1-4), **NAP visible**, testimonios verificables, y a ser posible **un nombre humano real** (no solo la marca "Xync"). |

**Quick win de Trust:** un nombre y cara reales en "Sobre Xync" suben el E-E-A-T más que cualquier
ajuste técnico — Google y la IA confían en personas identificables, no en marcas anónimas.

---

## 6. Construcción de la entidad "Xync" (FASE 6 — la palanca que falta)

Sin esto, los pasajes citables rinden poco: la IA no cita lo que no puede corroborar.

1. **Google Business Profile** como *negocio de área de servicio* (sin dirección pública): categoría
   "Diseñador de páginas web" / "Servicio de desarrollo web", área = Salamanca + provincia. Es tu
   mayor palanca local y de citación.
2. **LinkedIn** (perfil/empresa) y **GitHub** reales → mételos en `sameAs` del schema (sustituyendo
   los placeholders) y enlázalos en el footer.
3. **NAP idéntico** en web, GBP, LinkedIn y directorios. Cadena recomendada:
   `Xync — Salamanca, Castilla y León (España) — xyncdev@gmail.com`.
4. **3-5 citaciones** en directorios españoles de confianza (p. ej. fichas de freelance/empresa).
   No masivo: pocos y consistentes.
5. **Menciones**: un par de artículos de blog del cluster problema, compartidos, generan las
   primeras referencias rastreables de la entidad.

**llms.txt:** como pediste, **no es prioridad** — hoy no es una palanca de citación demostrada.
No inviertas ahí; el retorno está en la entidad (1-5) y los pasajes (§4).

**Verificación GEO (cómo sabrás que funciona):** dentro de 4-8 semanas tras (1-5), pregunta en
ChatGPT/Perplexity *"desarrollador web freelance en Salamanca"* y *"¿quién hace webs para
restaurantes en Salamanca?"*. El objetivo es que Xync aparezca o sea citado. Es un indicador que
puedes monitorizar sin reauditar.
