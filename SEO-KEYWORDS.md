# SEO-KEYWORDS — Clusters objetivo (FASE 5)

Seed: **"desarrollador web freelance Salamanca"**. Mercado: España (es-ES), base local
Salamanca + Castilla y León, secundario España + LATAM (remoto).

> ⚠️ **Sobre los volúmenes:** son **estimaciones** de búsquedas/mes en España basadas en el
> tamaño del mercado (Salamanca capital ~144k hab., provincia ~329k) y patrones conocidos de
> SEO local en España. No hubo acceso a un API de keywords en vivo (DataForSEO/Keyword Planner
> sin credenciales; PSI público sin cuota). **Valídalos** antes de fijar objetivos con: Google
> Keyword Planner, `/seo dataforseo keywords`, o Search Console (Rendimiento → Consultas) una vez
> indexado. La columna *Dificultad* es competitividad relativa, no KD de una herramienta.

**Realidad del mercado local:** los volúmenes de Salamanca son **bajos (decenas/mes)** pero de
**altísima intención y baja competencia** → conversión alta y rankeables rápido para un sitio
nuevo. La estrategia correcta es **ganar lo local primero** (donde puedes ser #1 en semanas) y
usar el contenido de servicio/problema para crecer hacia España.

---

## Arquitectura hub-and-spoke

```
HOME (/)  ── HUB local: "desarrollador/diseño web Salamanca"
│
├─ Spokes de SERVICIO (páginas dedicadas, intención transaccional España)
│   ├─ /diseno-web-salamanca           ← local + servicio (máxima prioridad)
│   ├─ /tiendas-online                 ← "crear tienda online"
│   ├─ /landing-pages-negocios-locales ← (ya existe; corregir acentos + añadir local)
│   └─ /paginas-web-restaurantes       ← nicho con caso real (Lumière)
│
└─ Spokes de PROBLEMA (blog, intención informacional → GEO/AI Overviews)
    ├─ /blog/cuanto-cuesta-una-pagina-web-en-espana
    ├─ /blog/por-que-mi-web-no-convierte
    └─ /blog/tienda-online-sin-ventas-que-hacer
```
Enlaza cada spoke ↔ home con anchor descriptivo ("desarrollador web en Salamanca", "crear tu
tienda online"). Mantén el total de páginas bajo control: **una sola landing local de base
(Salamanca)**; NO crees páginas-doormat por ciudad (Valladolid, Zamora…) hasta tener demanda real
(límite de aviso del propio framework: 30 páginas de localización).

---

## Cluster 1 · LOCAL (Salamanca) — PRIORIDAD MÁXIMA

Intención transaccional + local. Baja competencia, alta conversión. Objetivo: HOME + `/diseno-web-salamanca`.

| Keyword | Vol. est. ES/mes | Intención | Dificultad | Página objetivo |
|---|---:|---|---|---|
| diseño web Salamanca | 70–110 | Transaccional-local | Baja-Media | `/diseno-web-salamanca` |
| diseño páginas web Salamanca | 30–50 | Transaccional-local | Baja | `/diseno-web-salamanca` |
| desarrollador web Salamanca | 20–40 | Transaccional-local | Baja | HOME |
| programador web Salamanca | 10–30 | Transaccional-local | Baja | HOME |
| agencia diseño web Salamanca | 20–40 | Transaccional-local | Media | `/diseno-web-salamanca` |
| crear página web Salamanca | 10–20 | Transaccional-local | Baja | `/diseno-web-salamanca` |
| tienda online Salamanca | 10–20 | Transaccional-local | Baja | `/tiendas-online` |
| diseño web Castilla y León | 10–20 | Transaccional-regional | Baja | HOME/área |
| páginas web baratas Salamanca | 10–20 | Transaccional-local | Baja | (cuidado: filtra mal el lead) |

**Total cluster:** ~190–350 búsquedas/mes. **Captura realista #1-3:** muy alta para un sitio
nuevo bien optimizado + GBP. Aquí es donde primero verás resultados.

---

## Cluster 2 · SERVICIO (España) — CRECIMIENTO

Volumen nacional alto, competencia alta. No esperes top 3 rápido; trabaja con contenido + enlaces.
Objetivo: spokes de servicio.

| Keyword | Vol. est. ES/mes | Intención | Dificultad | Página objetivo |
|---|---:|---|---|---|
| crear tienda online | 2.400–4.400 | Transaccional | Alta | `/tiendas-online` |
| cuánto cuesta una página web | 1.000–2.000 | Comercial-investiga | Media-Alta | blog → CTA |
| diseño de landing page | 800–1.600 | Transaccional | Media-Alta | `/landing-pages-negocios-locales` |
| crear tienda online España | 200–400 | Transaccional | Media | `/tiendas-online` |
| landing page precio cerrado | 30–90 | Transaccional (long-tail oro) | Baja | `/landing-pages-...` |
| web para restaurante | 100–300 | Transaccional | Media | `/paginas-web-restaurantes` |
| diseño web para restaurantes | 90–200 | Transaccional | Media | `/paginas-web-restaurantes` |
| desarrollo web Next.js | 50–150 | Comercial (nicho técnico) | Baja-Media | HOME/about |

**Nota:** "landing page precio cerrado" y "desarrollo web Next.js" son long-tails de baja
competencia donde tu **diferencial real** (precio/plazo cerrados; stack Next.js) encaja perfecto.
Priorízalas dentro de este cluster.

---

## Cluster 3 · PROBLEMA (España) — GEO / AI Overviews

Intención informacional. Volumen medio, **competencia baja** y altísima encaje con IA generativa
(respuestas citables). Objetivo: blog. Cada artículo termina en CTA a servicio.

| Keyword | Vol. est. ES/mes | Intención | Dificultad | Formato |
|---|---:|---|---|---|
| por qué mi web no convierte | 50–150 | Informacional | Baja | Artículo + checklist |
| web que no convierte | 30–90 | Informacional | Baja | Artículo |
| tienda online sin ventas | 40–110 | Informacional | Baja | Artículo + caso Grieta |
| mi tienda online no vende | 30–90 | Informacional | Baja | Artículo |
| web lenta en Google | 40–110 | Informacional | Baja | Artículo (Core Web Vitals) |
| mejorar velocidad de una web | 200–500 | Informacional | Media | Artículo técnico |
| cómo aparecer en Google con mi negocio | 100–300 | Informacional-local | Media | Artículo (puente a local) |

**Por qué este cluster es tu palanca GEO:** son exactamente las preguntas que un dueño de negocio
le hace a ChatGPT/Gemini. Respuestas auto-contenidas (134-167 palabras) que nombran a Xync y
Salamanca se convierten en pasajes citables. Ver [SEO-COPY-AI-OVERVIEWS.md](SEO-COPY-AI-OVERVIEWS.md).

---

## Mapa keyword → intención → siguiente acción

1. **Empieza por Cluster 1** (local). Es donde un sitio nuevo gana #1 en semanas y donde el lead
   convierte mejor. Necesita: señal local on-page (P1-1) + schema local (P1-2) + GBP.
2. **Cluster 3** en paralelo (blog) — bajo coste, alimenta GEO y enlaza a servicios.
3. **Cluster 2** a medio plazo, apoyado en autoridad ganada con 1 y 3.

**Validación recomendada antes de comprometer recursos:** exporta estas keywords a Keyword Planner
o ejecuta `/seo dataforseo keywords` (si instalas la extensión) para volúmenes y KD reales de
Salamanca; y revisa el SERP a mano para 3-4 locales — si el top 10 son directorios (paginasamarillas,
habitissimo) y no negocios locales reales, tu oportunidad de colarte como #1 local es aún mayor.
