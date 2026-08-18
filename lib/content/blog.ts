/**
 * Contenido del blog de Xync.
 *
 * El blog existe para SEO y para demostrar criterio (E-E-A-T), no como diario:
 * cada artículo responde una pregunta real que hace un cliente NO técnico y
 * nace de un proyecto propio. Reglas editoriales:
 *
 * - `intro` es el primer párrafo del artículo: autosuficiente y citable
 *   (134–167 palabras), responde directamente la pregunta del título. Es lo
 *   que un AI Overview o ChatGPT pueden citar sin más contexto.
 * - Los H2/H3 van en formato pregunta cuando el contenido responde una
 *   búsqueda real ("¿Por qué mi web va lenta en móvil?").
 * - `evidence` conecta el punto con un proyecto real (/proyectos/[slug]).
 * - Enlaces inline con la sintaxis [texto](/ruta) dentro de párrafos, listas
 *   y citas: el renderer los convierte en <Link> internos o <a> externos.
 *   Nunca se inyecta HTML crudo.
 *
 * El tiempo de lectura NO se guarda a mano: se calcula del contenido
 * (getReadingTime) para que nunca quede desactualizado al editar.
 */

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; style: "bullet" | "number"; items: string[] }
  | { type: "quote"; text: string; source?: string }
  | { type: "evidence"; text: string; projectSlug: string; projectName: string }
  | { type: "image"; src: string; alt: string; width: number; height: number; caption?: string; blurDataURL?: string }
  | { type: "code"; language: string; code: string };

export interface BlogCta {
  /** Titular del CTA, conectado al tema del artículo (no un banner genérico). */
  title: string;
  text: string;
  label: string;
  href: string;
}

export interface BlogPost {
  /** Segmento de URL en /blog/[slug]. Estable y único. */
  slug: string;
  title: string;
  /** Meta description y resumen de una línea en el listado (150–160 car.). */
  excerpt: string;
  /** Primer párrafo citable (134–167 palabras). Responde el título. */
  intro: string;
  /** ISO 8601 (YYYY-MM-DD). */
  publishedAt: string;
  updatedAt?: string;
  category: string;
  content: BlogBlock[];
  cta: BlogCta;
  /** Marcado en el CMS para destacarse en /blog (fallback: el más reciente). */
  featured?: boolean;
  /**
   * Palabras de intro + cuerpo cuando la fuente no trae el cuerpo cargado
   * (tarjetas de Sanity en listados). Si está, getReadingTime lo usa en vez
   * de contar los bloques.
   */
  wordCount?: number;
  /** Nombre del autor (CMS). Si falta, la firma cae al titular del estudio. */
  authorName?: string;
  /** Overrides SEO del CMS; si faltan se usa title/excerpt. */
  seoTitle?: string;
  seoDescription?: string;
  /** Imagen OG propia del artículo (CMS); si falta, la OG del sitio. */
  ogImage?: { src: string; alt: string; width: number; height: number };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "tu-web-tiene-visitas-pero-no-vende",
    title: "Tu web tiene visitas pero no vende: las cinco fugas que encontramos en casi todas las auditorías",
    excerpt:
      "Tráfico sin ventas casi nunca es un problema de marketing: es la web. Las cinco fugas de conversión que vemos al auditar webs de negocios reales.",
    intro:
      "Si tu web recibe visitas pero nadie escribe, llama ni compra, el problema casi nunca está en el tráfico: está en lo que la visita encuentra al llegar. En las auditorías que hacemos a negocios de Salamanca y de fuera, el patrón se repite: el mensaje principal no dice qué vendes ni para quién, la página tarda demasiado en el móvil, el botón de contacto compite con otras cinco cosas, no hay ninguna prueba de que detrás haya alguien de fiar, y pedir presupuesto exige rellenar un formulario que parece una declaración de la renta. Cada una de esas fugas por separado parece pequeña; juntas, convierten una web con buen tráfico en un escaparate que nadie toca. La buena noticia es que ninguna exige rehacerlo todo: se arreglan por orden de impacto, midiendo cada cambio. Esto es exactamente lo que revisamos, punto por punto, antes de proponer cualquier rediseño.",
    publishedAt: "2026-07-20",
    category: "Conversión",
    content: [
      {
        type: "paragraph",
        text: "Una visita que llega a tu web decide en segundos si se queda o se vuelve a Google. No lee: escanea. Busca tres cosas —qué es esto, es para mí, qué hago ahora— y si no las encuentra sin esfuerzo, se va. Estas son las cinco fugas donde se escapa esa decisión, ordenadas de mayor a menor impacto.",
      },
      {
        type: "heading",
        level: 2,
        text: "¿Qué vendes y a quién? El titular que no responde",
      },
      {
        type: "paragraph",
        text: "La fuga más cara es conceptual: un titular que habla de ti («Soluciones integrales de calidad desde 1998») en lugar de hablar del resultado que busca el cliente. La prueba es sencilla: enseña tu home cinco segundos a alguien que no te conozca y pregúntale qué vendes y para quién. Si duda, estás pagando tráfico para calentar el de la competencia.",
      },
      {
        type: "heading",
        level: 2,
        text: "¿Cuánto tarda en cargar en un móvil con datos?",
      },
      {
        type: "paragraph",
        text: "Más de la mitad de tus visitas entran desde el móvil, muchas con cobertura justa. Google mide que si la carga pasa de tres segundos, más de la mitad de esas visitas abandona antes de ver tu oferta. No es una métrica técnica: es gente que nunca llegó a leerte. Lo desglosamos en [por qué tu web va lenta en el móvil](/blog/web-lenta-movil-cuanto-cuesta-cada-segundo).",
      },
      {
        type: "heading",
        level: 2,
        text: "¿Una acción clara o cinco compitiendo?",
      },
      {
        type: "paragraph",
        text: "Menú con doce opciones, tres botones distintos, un pop-up y un banner de cookies encima: cada elemento que compite diluye la única acción que te interesa. Una página de servicio efectiva tiene una acción principal evidente —pedir presupuesto, reservar, llamar— repetida en los momentos en que el lector ya está convencido, no antes.",
      },
      {
        type: "heading",
        level: 2,
        text: "¿Por qué deberían fiarse de ti?",
      },
      {
        type: "paragraph",
        text: "Nadie deja su email ni su dinero en una web que no le da confianza. La prueba social no es decoración: es la respuesta a la pregunta silenciosa de toda visita nueva. Y no vale cualquier cosa —los logos de clientes sin contexto o las estrellas genéricas no dicen nada.",
      },
      {
        type: "list",
        style: "bullet",
        items: [
          "Casos con problema y resultado concretos, no «quedaron encantados».",
          "Testimonios con nombre, cargo y empresa reales.",
          "Datos de contacto visibles: email, teléfono, ciudad. Una web sin rostro genera desconfianza.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "¿Cuánto esfuerzo pides para contactar?",
      },
      {
        type: "paragraph",
        text: "La última fuga está en la línea de meta: formularios de nueve campos, teléfonos que no son clicables en móvil, emails escondidos en un PDF. Cada campo extra en un formulario reduce las respuestas. Pide lo mínimo para poder contestar —nombre, email y qué necesita— y deja el resto para la primera conversación.",
      },
      {
        type: "evidence",
        text: "En Grieta la fuga principal era la confianza: vendían por marketplaces y su propia web no demostraba que comprar directo a ellos era mejor opción. Rehicimos la tienda poniendo el resultado por delante —producto, precio sin comisión y garantías visibles— y las ventas directas dejaron de ser la excepción.",
        projectSlug: "grieta",
        projectName: "Grieta",
      },
      {
        type: "quote",
        text: "Una web que no vende no tiene un problema de diseño ni de visitas: tiene respuestas que el cliente no encuentra a tiempo.",
      },
    ],
    cta: {
      title: "¿Tu web tiene alguna de estas fugas?",
      text: "Cuéntanos tu caso y te decimos con franqueza qué revisaríamos primero — sin compromiso y sin jerga técnica.",
      label: "Cuéntanos tu caso",
      href: "/#contacto",
    },
  },
  {
    slug: "tienda-online-propia-vs-marketplaces-comisiones",
    title: "Marketplaces te cobran por cada venta: cuándo te compensa montar tu tienda online propia",
    excerpt:
      "Amazon o Etsy se llevan entre el 8% y el 15% de cada venta y se quedan con tu cliente. Cuándo compensa una tienda propia, con números y un caso real.",
    intro:
      "Montar una tienda online propia compensa cuando el marketplace te cuesta más que solo comisiones: te cobra entre un 8% y un 15% por venta, decide quién ve tu producto, se queda con los datos de tu cliente y te prohíbe llevártelo fuera. Con una tienda propia pagas solo el procesado del pago —en torno a un 1,5%–2,5% con Stripe—, el cliente es tuyo para siempre y cada venta construye tu marca en Google, no la del marketplace. El punto de equilibrio llega antes de lo que parece: si vendes con regularidad, una comisión del 12% sobre 3.000 € al mes son 360 € mensuales que financia tu propia tienda en poco más de un año, y a partir de ahí es margen que recuperas en cada pedido. Eso sí: la tienda propia exige atraer tus propias visitas, así que el momento de dar el paso es cuando ya tienes demanda demostrada y clientes que repiten, no el día que abres el negocio.",
    publishedAt: "2026-07-06",
    category: "Ecommerce",
    content: [
      {
        type: "heading",
        level: 2,
        text: "¿Cuánto te cuesta realmente vender en un marketplace?",
      },
      {
        type: "paragraph",
        text: "La comisión visible es solo la primera línea. Suma el coste de destacar en su buscador interno, la presión para bajar precios frente a competidores que ves al lado de tu ficha, y las devoluciones gestionadas bajo sus reglas. Pero el coste mayor no aparece en ninguna factura: el cliente que te compra es del marketplace. No puedes escribirle, no puedes ofrecerle la segunda compra, no sabes ni su email.",
      },
      {
        type: "list",
        style: "bullet",
        items: [
          "Comisión por venta: 8%–15% según plataforma y categoría.",
          "Publicidad interna casi obligatoria para tener visibilidad.",
          "Cero relación con el cliente: no hay email, no hay recompra, no hay marca.",
          "Tu ficha vive rodeada de alternativas más baratas, en la misma pantalla.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "¿Cuándo compensa dar el salto a una tienda propia?",
      },
      {
        type: "paragraph",
        text: "No es una decisión de fe, es de números. Tres señales claras de que el momento ha llegado:",
      },
      {
        type: "list",
        style: "number",
        items: [
          "Vendes con regularidad y las comisiones mensuales ya superan lo que costaría mantener tu tienda (hosting, pasarela y algo de tiempo).",
          "Tienes clientes que repiten: cada recompra por tu tienda es margen íntegro que antes pagaba comisión.",
          "Tu producto se busca en Google: si hay búsquedas de lo que vendes, tu tienda puede captarlas con SEO, algo que un marketplace nunca hará por ti.",
        ],
      },
      {
        type: "paragraph",
        text: "La estrategia que mejor funciona no es la fuga total el primer día: mantén el marketplace como escaparate de captación mientras tu tienda crece en Google, y mueve a tu tienda a los clientes que ya te conocen. En dos temporadas el canal propio suele superar al alquilado.",
      },
      {
        type: "evidence",
        text: "Grieta vendía moda solo por marketplaces: cada venta pagaba comisión y ninguna construía marca. Montamos su tienda con Medusa.js —sin cuota mensual obligatoria ni comisión por transacción— con cada producto optimizado para Google. El resultado: ventas directas que crecen mes a mes y una base de clientes que por fin es suya.",
        projectSlug: "grieta",
        projectName: "Grieta",
      },
      {
        type: "evidence",
        text: "Cenit tenía el mismo problema vendiendo por Instagram: sin catálogo propio ni control sobre el cliente. Su tienda con sistema de drops convirtió cada lanzamiento en un evento con urgencia real de compra, con margen completo en cada pedido.",
        projectSlug: "cenit",
        projectName: "Cenit",
      },
      {
        type: "quote",
        text: "El marketplace te alquila a tus propios clientes. La tienda propia es el día que dejas de pagar ese alquiler.",
      },
      {
        type: "paragraph",
        text: "¿La tecnología importa? Sí, pero menos de lo que crees: lo importante es que la tienda sea tuya (sin cuotas que crezcan con tus ventas), cargue rápido en móvil y esté construida para posicionarse. Nosotros la montamos con Medusa.js y Next.js precisamente por eso — es lo que usamos en todos nuestros [proyectos de ecommerce](/proyectos).",
      },
    ],
    cta: {
      title: "¿Pagas comisiones por cada venta?",
      text: "Cuéntanos qué vendes y cuánto facturas al mes: te decimos con números si ya te compensa la tienda propia y qué costaría montarla, con precio cerrado.",
      label: "Hablemos de tu tienda",
      href: "/#contacto",
    },
  },
  {
    slug: "como-aparecer-en-google-negocio-local-salamanca",
    title: "Cómo aparecer en Google cuando alguien busca tu negocio en Salamanca",
    excerpt:
      "El SEO local decide a qué negocio de Salamanca llama el cliente que busca «cerca de mí». Las cinco palancas que de verdad mueven esas búsquedas.",
    intro:
      "Aparecer en Google cuando alguien busca tu negocio en Salamanca depende de cinco palancas que se pueden trabajar desde el primer mes: una ficha de Google Business Profile completa y con reseñas recientes, una web que diga con claridad qué haces y dónde — con la ciudad en títulos, textos y datos estructurados—, páginas específicas para cada servicio que ofreces, datos de contacto idénticos en todos los sitios donde apareces, y una web que cargue rápido en el móvil, porque la mayoría de búsquedas locales ocurren en la calle. El SEO local es la disciplina menos exótica del marketing: no exige viralidad ni presupuesto de anuncios, exige consistencia. Quien busca «restaurante en Salamanca centro» o «fontanero cerca de mí» tiene la tarjeta en la mano: Google decide a cuál de los tres negocios del mapa llama, y esa decisión se gana con señales aburridas repetidas durante meses. Así es como lo trabajamos con negocios locales de Salamanca.",
    publishedAt: "2026-06-22",
    category: "SEO local",
    content: [
      {
        type: "heading",
        level: 2,
        text: "¿Por dónde empieza un negocio local en Google?",
      },
      {
        type: "paragraph",
        text: "Por la ficha de Google Business Profile, que es gratuita y decide el mapa: nombre real del negocio (sin keywords añadidas, que penaliza), categoría principal exacta, horarios siempre actualizados, fotos de verdad y reseñas. Las reseñas son la moneda del SEO local: pídelas después de cada trabajo bien hecho y contesta todas, también las malas — una respuesta serena a una mala reseña vende más que diez reseñas de cinco estrellas sin contestar.",
      },
      {
        type: "heading",
        level: 2,
        text: "¿Qué tiene que decir tu web para posicionar en Salamanca?",
      },
      {
        type: "paragraph",
        text: "Tu web tiene que responder, en texto que Google pueda leer, tres cosas: qué haces, para quién y dónde. Suena obvio, pero la mayoría de webs locales lo esconden: la ciudad solo aparece en el pie de página, los servicios caben en una sola página genérica y el título de la home dice «Bienvenido a nuestra web».",
      },
      {
        type: "list",
        style: "bullet",
        items: [
          "La ciudad y la zona en el título principal, en los encabezados y de forma natural en los textos — no como lista de keywords al final.",
          "Una página por servicio: «cartas para restaurantes» y «web para restaurante» no compiten por la misma búsqueda que «diseño web».",
          "Datos estructurados de negocio local (schema.org) con dirección, zona y servicios: es como Google confirma que eres quien dices ser.",
          "Nombre, dirección y teléfono idénticos en web, ficha de Google y directorios — las discrepancias siembran dudas en el algoritmo.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "¿Y cuánto tarda en notarse?",
      },
      {
        type: "paragraph",
        text: "La ficha bien trabajada se nota en semanas; la web, en meses. El SEO local es un activo que se compone: cada reseña, cada página de servicio y cada mes de consistencia suman sobre lo anterior. Por eso los negocios que empiezan pronto son casi imposibles de alcanzar para el que empieza tarde.",
      },
      {
        type: "evidence",
        text: "Lumière llenaba los fines de semana pero no aparecía cuando alguien buscaba dónde comer en Salamanca entre semana. Su web con carta dinámica y SEO local —datos estructurados, carta visible en Google, páginas pensadas para búsquedas de cercanía— convirtió las búsquedas en reservas de martes a jueves.",
        projectSlug: "lumiere",
        projectName: "Lumière",
      },
      {
        type: "quote",
        text: "El SEO local no es pelear con el algoritmo: es dejarle a Google tan claro quién eres y dónde estás que recomendarte sea su opción más fácil.",
      },
      {
        type: "paragraph",
        text: "Si tu negocio depende de que te encuentren cerca, una [landing pensada para negocios locales](/landing-pages-negocios-locales) es la pieza que convierte esas búsquedas en contactos: una página rápida, con tu propuesta clara y tu teléfono a un toque de distancia.",
      },
    ],
    cta: {
      title: "¿Tu negocio no aparece cuando te buscan?",
      text: "Escríbenos con el nombre de tu negocio y tu ciudad: te contamos qué está fallando y qué haríamos en el primer mes, sin jerga.",
      label: "Pide una revisión",
      href: "/#contacto",
    },
  },
  {
    slug: "web-lenta-movil-cuanto-cuesta-cada-segundo",
    title: "¿Por qué tu web va lenta en el móvil (y cuánto te cuesta cada segundo)?",
    excerpt:
      "Tu web no va lenta «porque sí»: son imágenes sin optimizar, scripts de terceros y un hosting barato. Cómo saber si te pasa y qué exigir al arreglarlo.",
    intro:
      "Tu web va lenta en el móvil, casi con seguridad, por tres causas que se pueden arreglar: imágenes pesadas que se subieron sin optimizar, scripts de terceros que se cargan antes que tu propio contenido —chats, píxeles, widgets— y un hosting barato que responde con calma cuando llegan varias visitas a la vez. El móvil lo nota el doble porque suma una conexión inestable y un procesador modesto. El coste no es abstracto: Google mide que superar los tres segundos de carga hace que más de la mitad de las visitas abandone antes de ver tu oferta, y desde 2021 la velocidad en móvil influye directamente en qué posición ocupas en el buscador. Es decir, una web lenta paga dos veces: pierde clientes que ya habían llegado y recibe menos clientes nuevos. Comprobarlo te lleva dos minutos con la herramienta gratuita PageSpeed Insights de Google, y las causas habituales tienen soluciones conocidas y acotadas — no hace falta rehacer la web entera para ganar los primeros segundos.",
    publishedAt: "2026-06-08",
    category: "Rendimiento",
    content: [
      {
        type: "heading",
        level: 2,
        text: "¿Cómo saber si tu web tiene un problema de velocidad?",
      },
      {
        type: "paragraph",
        text: "Entra en pagespeed.web.dev, escribe tu dirección y mira el apartado de móvil. La cifra que importa es el LCP —el tiempo hasta que el contenido principal es visible—: por debajo de 2,5 segundos está bien, entre 2,5 y 4 necesita mejora, y por encima de 4 estás perdiendo visitas antes de enseñarles nada. No te asustes por la nota global de colores: es una aproximación, no una sentencia.",
      },
      {
        type: "heading",
        level: 2,
        text: "¿Qué es lo que casi siempre frena una web en móvil?",
      },
      {
        type: "list",
        style: "number",
        items: [
          "Imágenes de varios megas subidas tal cual salieron del móvil o del banco de fotos, cuando el navegador solo necesita una versión ligera y del tamaño justo.",
          "Scripts de terceros que mandan sobre tu contenido: el chat, el píxel de anuncios, el widget de reseñas, el mapa… cada uno añade su peaje antes de que tu página se vea.",
          "Un hosting de tres euros compartido con miles de webs: responde lento en el mejor momento del día, que es justo cuando a ti te visitan.",
        ],
      },
      {
        type: "paragraph",
        text: "El orden del listado es también el orden de impacto habitual: comprimir y servir imágenes modernas suele ser la mejora más grande y más barata; auditar qué scripts son realmente necesarios, la segunda; y mover la web a un alojamiento digno, la tercera. Las tres juntas suelen bastar para bajar de «lenta» a «instantánea» sin tocar el diseño.",
      },
      {
        type: "heading",
        level: 2,
        text: "¿Qué debes exigir cuando te «optimicen» la web?",
      },
      {
        type: "paragraph",
        text: "Exige mediciones antes y después, no promesas: el mismo informe de PageSpeed en las mismas páginas. Y exige que la velocidad se sostenga — hay «arreglos» que consisten en maquillar el test mientras la experiencia real sigue igual de lenta. La pregunta correcta no es «¿mejorará la nota?» sino «¿cuánto tardará mi web en enseñar el contenido en un móvil con 4G?».",
      },
      {
        type: "evidence",
        text: "Lumen vende muebles: catálogo grande, muchas fotos, clientes que filtran desde el sofá con el móvil. Construimos la tienda con imágenes optimizadas por dispositivo y una ficha que muestra lo esencial al instante — el cliente empieza a filtrar mientras el resto termina de cargar, en lugar de mirar una pantalla en blanco.",
        projectSlug: "lumen",
        projectName: "Lumen",
      },
      {
        type: "quote",
        text: "Nadie recuerda una web que cargó rápido. Todos recuerdan la que les hizo esperar: esperar es el mensaje.",
      },
      {
        type: "paragraph",
        text: "La velocidad tampoco es un capricho técnico: es la primera impresión de tu negocio. Una web que responde al instante comunica lo mismo que una tienda ordenada — y es una de las cinco fugas que revisamos cuando [una web tiene visitas pero no vende](/blog/tu-web-tiene-visitas-pero-no-vende).",
      },
    ],
    cta: {
      title: "¿Tu web tarda más de tres segundos en el móvil?",
      text: "Pásanos tu dirección y te decimos qué la está frenando y qué ganarías arreglándolo — con mediciones, no con intuiciones.",
      label: "Cuéntanos tu caso",
      href: "/#contacto",
    },
  },
];

/** Busca un artículo por su slug de URL. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Artículos ordenados de más reciente a más antiguo (para el listado). */
export function getPostsByDate(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * Relacionados: misma categoría primero, luego los más recientes, excluyendo
 * el propio artículo. Máximo `limit` (por defecto 3, nunca el listado entero).
 * Función pura compartida por la fuente local y por Sanity (lib/blog/*).
 */
export function pickRelatedPosts(all: BlogPost[], slug: string, limit = 3): BlogPost[] {
  const current = all.find((post) => post.slug === slug);
  if (!current) return [];

  const others = all.filter((post) => post.slug !== slug);
  const sameCategory = others.filter((post) => post.category === current.category);
  const rest = others.filter((post) => post.category !== current.category);

  return [...sameCategory, ...rest].slice(0, limit);
}

const WORDS_PER_MINUTE = 200;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function countBlockWords(block: BlogBlock): number {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
      return countWords(block.text) + ("source" in block && block.source ? countWords(block.source) : 0);
    case "list":
      return block.items.reduce((total, item) => total + countWords(item), 0);
    case "evidence":
      return countWords(block.text);
    case "image":
      return block.caption ? countWords(block.caption) : 0;
    case "code":
      // El código no se "lee" como prosa: no infla el tiempo de lectura.
      return 0;
  }
}

function resolveWordCount(post: BlogPost): number {
  if (typeof post.wordCount === "number") return post.wordCount;
  return (
    countWords(post.intro) +
    post.content.reduce((total, block) => total + countBlockWords(block), 0)
  );
}

/** "X min de lectura", calculado del contenido real (≈200 palabras/min). */
export function getReadingTime(post: BlogPost): string {
  const minutes = Math.max(2, Math.round(resolveWordCount(post) / WORDS_PER_MINUTE));
  return `${minutes} min de lectura`;
}

/** Número de palabras del cuerpo (para wordCount del schema BlogPosting). */
export function getWordCount(post: BlogPost): number {
  return resolveWordCount(post);
}

const postDateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Fecha larga en español, estable en servidor (zona UTC fija). */
export function formatPostDate(isoDate: string): string {
  return postDateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
