/**
 * Contenido de la landing de servicios freelance.
 *
 * El copy está orientado al PROBLEMA del cliente (no técnico), no a la
 * tecnología. Los textos de servicios, proceso y FAQ son reales y editables;
 * los datos PERSONALES y de clientes (nombre, proyectos, testimonios, enlaces)
 * van entre [CORCHETES] como placeholders a sustituir — ver PORTFOLIO.md.
 */

export interface SocialLink {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Service {
  id: string;
  /** Titular desde el problema que resuelve, no desde la tecnología. */
  title: string;
  description: string;
  /** Resultado esperado para el cliente. */
  result: string;
  /** A quién va dirigido. */
  audience: string;
}

export interface ProcessStep {
  title: string;
  /** Qué hace el cliente. */
  you: string;
  /** Qué hago yo. */
  me: string;
  /** Cuándo ve resultados. */
  when: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  /** Segmento de URL en /proyectos/[slug]. Estable y único. */
  slug: string;
  title: string;
  sector: string;
  /** El problema de negocio que tenía el cliente. */
  problem: string;
  /** Qué se construyó. */
  built: string;
  /** Qué resultado tuvo (medible si es posible). */
  result: string;
  /** Tecnologías usadas — se listan en el detalle. */
  stack: string[];
  /** Capturas ADICIONALES (rutas en /public); la principal es `image`. */
  images: string[];
  liveUrl?: string;
  image: ProjectImage;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Identity {
  name: string;
  /** Qué hago y para quién — en dos líneas en el hero. */
  headline: string;
  /** Subtítulo orientado al problema del cliente. */
  subhead: string;
  availability: string;
  responseTime: string;
  /** Base local para el SEO de Salamanca (NAP consistente en web/GBP/redes). */
  location: string;
  email: string;
  /** Cal.com link slug: "usuario/30min" — sin dominio. */
  calUrl: string;
  socials: SocialLink[];
}

/**
 * Comprueba que una URL es real y no un placeholder a rellenar (los del tipo
 * `https://[enlace-en-vivo.com]`). Evita renderizar enlaces rotos o exponer
 * URLs inválidas en los datos estructurados (JSON-LD) mientras el contenido
 * definitivo aún no está cargado.
 */
export function isRealUrl(url?: string): url is string {
  if (!url) return false;
  if (url.includes("[") || url.includes("]")) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

export const identity: Identity = {
  name: "Xync",
  headline:
    "Desarrollamos webs, tiendas online y productos digitales en Salamanca para hacer crecer tu negocio.",
  subhead:
    "¿Tu web va lenta, no convierte o se quedó a medias? La dejamos rápida, clara y lista para vender — con plazos cerrados que se cumplen.",
  availability: "Libres para empezar en julio",
  responseTime: "Te respondemos hoy",
  location: "Salamanca, Castilla y León",
  email: "contacto@xync.es",
  calUrl: "xync-ulzw2t/15min",
  socials: [
    { label: "Discord", href: "https://discord.gg/aENy8Sb4rS" },
    { label: "TikTok", href: "https://www.tiktok.com/@xyncdev" },
  ],
};
/**
 * Datos fiscales/legales del titular (autónomo). FUENTE ÚNICA para el aviso
 * legal, la política de privacidad y los datos estructurados (NAP consistente).
 * El nombre REAL se usa como `Person` en el schema (señal E-E-A-T); la marca
 * pública sigue siendo `identity.name` ("Xync").
 */
export interface LegalEntity {
  /** Nombre y apellidos del titular. */
  legalName: string;
  nif: string;
  /** Vía, número y piso. */
  street: string;
  /** Código postal (déjalo vacío si aún no lo añades; se omite del schema). */
  postalCode: string;
  locality: string;
  region: string;
  /** Código ISO 3166-1 alpha-2. */
  countryCode: string;
  countryName: string;
}

export const legalEntity: LegalEntity = {
  legalName: "Alejandro Martín Herrero",
  nif: "70912847-L",
  street: "Calle Pizarrales, 38, 3º A",
  postalCode: "37003", // ← añade tu código postal de Salamanca
  locality: "Salamanca",
  region: "Castilla y León",
  countryCode: "ES",
  countryName: "España",
};

export const navLinks: NavLink[] = [
  { label: "Servicios", href: "#servicios" },
  { label: "Cómo trabajo", href: "#proceso" },
  { label: "Proyectos", href: "#proyectos" },
];

export const services: Service[] = [
  {
    id: "construir",
    title: "Tu web o tienda online, rápida y sin fallos",
    description:
      "Construimos desde cero la web o la aplicación de tu negocio: fácil de usar, que carga al instante en el móvil y lista para empezar a vender.",
    result: "Un producto en marcha, medible y preparado para crecer.",
    audience: "Para fundadores que lanzan algo nuevo.",
  },
  {
    id: "arreglar",
    title: "Tu web actual, arreglada y puesta a punto",
    description:
      "Reparamos lo que va lento, falla o frena las ventas, y dejamos tu web mantenible para que no vuelva a romperse cada dos por tres.",
    result:
      "Menos errores, más velocidad y más clientes que terminan comprando.",
    audience: "Para negocios con una web que se quedó corta.",
  },
  {
    id: "rediseñar",
    title: "Rediseño web a la altura de tu producto",
    description:
      "Rediseñamos la interfaz para que tu producto se vea profesional y se entienda en segundos, sin perder a nadie por el camino.",
    result: "Una experiencia clara que genera confianza y convierte mejor.",
    audience: "Para equipos que necesitan dar el salto de calidad.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Hablamos de tu objetivo",
    you: "Nos cuentas qué necesitas y qué sería un éxito para ti.",
    me: "Te decimos con franqueza si podemos ayudarte y cómo lo enfocaríamos.",
    when: "En la primera llamada, sin coste.",
  },
  {
    title: "Te pasamos un plan y un precio cerrado",
    you: "Revisas alcance, plazo y precio. Sin letra pequeña.",
    me: "Dejamos por escrito qué se entrega y cuándo.",
    when: "En 48 h tras hablar.",
  },
  {
    title: "Construimos y te enseñamos avances",
    you: "Ves el progreso en cada hito y das tu opinión.",
    me: "Desarrollamos por fases y te mostramos resultados reales, no promesas.",
    when: "Cada semana.",
  },
  {
    title: "Lanzamos y te dejamos todo en orden",
    you: "Recibes tu producto funcionando, listo para usar.",
    me: "Nos aseguramos de que vaya rápido, sin errores y fácil de mantener.",
    when: "En la fecha que acordamos.",
  },
];

export const projects: Project[] = [
  {
    id: "proyecto-1",
    slug: "grieta",
    title: "Grieta — Tienda online sin comisiones",
    sector: "Ecommerce online",
    problem:
      "Vendían en marketplaces de terceros pagando comisiones altas y sin visibilidad propia en Google. Cada venta dependía de la plataforma, no de ellos.",
    built:
      "Tienda propia con Medusa.js — rápida, con cada producto optimizado para aparecer en buscadores y sin intermediarios que se lleven parte de cada venta.",
    result:
      "Más ventas directas, menos comisiones y clientes que llegan solos desde Google.",
    stack: [
      "Next.js",
      "Medusa.js",
      "React",
      "PostgreSQL",
      "Stripe",
      "SEO técnico",
    ],
    images: [
      "/portfolio/grieta-detalle.webp",
      "/portfolio/grieta-detalle-2.webp",
    ],
    liveUrl: "https://grieta.xync.es/",
    image: {
      src: "/portfolio/hero-image.webp",
      alt: "Tienda online Grieta, desarrollada por Xync, estudio de desarrollo web en Salamanca",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-2",
    slug: "the-byte",
    title: "The Byte — Periódico digital optimizado para SEO",
    sector: "Periódico digital",
    problem:
      "Publicaban buen contenido que nadie leía. No aparecían en Google y cada artículo nuevo requería ayuda técnica para subirse.",
    built:
      "Periódico digital donde la redacción publica de forma autónoma y cada artículo está construido para posicionarse y atraer lectores desde el primer día.",
    result:
      "Más lectores mes a mes sin pagar publicidad, solo con contenido que Google encuentra y recomienda.",
    stack: ["Next.js", "React", "CMS headless", "MDX", "SEO técnico", "ISR"],
    images: [
      "/portfolio/the-byte-detalle-1.webp",
      "/portfolio/the-byte-detalle-2.webp",
    ],
    liveUrl: "https://thebyte.xync.es/",
    image: {
      src: "/portfolio/proyecto-2.webp",
      alt: "Periódico digital The Byte desarrollado por Xync",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-3",
    slug: "lumiere",
    title: "Lumière — Web de restaurante con carta dinámica",
    sector: "Restaurante",
    problem:
      "Llenos los fines de semana pero vacíos entre semana. No aparecían cuando alguien buscaba en Google dónde comer cerca.",
    built:
      "Web con carta dinámica que el restaurante actualiza solo, optimizada para aparecer en búsquedas locales y mostrar la carta directamente en Google.",
    result:
      "Más reservas entre semana y nuevos clientes que llegan directamente desde el buscador.",
    stack: ["Next.js", "React", "Carta dinámica", "SEO local", "Schema.org"],
    images: [
      "/portfolio/lumiere-detalle-1.webp",
      "/portfolio/lumiere-detalle-2.webp",
    ],
    liveUrl: "https://lumiere.xync.es/",
    image: {
      src: "/portfolio/proyecto-3.webp",
      alt: "Web del restaurante Lumière con carta dinámica desarrollada por Xync",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-4",
    slug: "cenit",
    title: "Cenit — Panel de reservas y clientes a medida",
    sector: "Producto digital",
    problem:
      "Gestionaban reservas y clientes en hojas de cálculo y WhatsApp. Se solapaban citas, se perdían avisos y cada alta era trabajo manual.",
    built:
      "Un panel a medida donde el equipo ve la agenda del día, gestiona clientes y cobros, y los usuarios reservan solos desde el móvil sin llamar por teléfono.",
    result:
      "Cero solapamientos, menos huecos sin cubrir y horas de gestión manual que desaparecen cada semana.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "Stripe",
      "Autenticación",
    ],
    images: [
      "/portfolio/cenit-detalle-1.webp",
      "/portfolio/cenit-detalle-2.webp",
    ],
    image: {
      src: "/portfolio/cenit.webp",
      alt: "Panel de gestión y reservas Cenit, producto digital desarrollado por Xync en Salamanca",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-5",
    slug: "lumen",
    title: "Lumen — Web de clínica con cita online",
    sector: "Clínica y servicios locales",
    problem:
      "Una clínica sin web propia dependía de portales de terceros para captar pacientes y no aparecía cuando alguien buscaba su especialidad en la ciudad.",
    built:
      "Una web clara con sus servicios, su equipo y reserva de cita online, optimizada para las búsquedas locales de su especialidad en Salamanca.",
    result:
      "Pacientes que la encuentran directamente en Google y piden cita sin intermediarios de por medio.",
    stack: ["Next.js", "React", "SEO local", "Schema.org", "Reserva online"],
    images: [
      "/portfolio/lumen-detalle-1.webp",
      "/portfolio/lumen-detalle-2.webp",
    ],
    image: {
      src: "/portfolio/lumen.webp",
      alt: "Web de la clínica Lumen con reserva de cita online, desarrollada por Xync en Salamanca",
      width: 1600,
      height: 1000,
    },
  },
];

/** Descripciones SEO (150-160 car., con problema y resultado) para el detalle. */
export const projectSeo: Record<string, string> = {
  grieta:
    "Grieta dependía de marketplaces con comisiones y sin visibilidad en Google. Su tienda online propia, hecha en Salamanca: más ventas directas y sin comisiones.",
  "the-byte":
    "The Byte publicaba contenido que nadie hallaba en Google. Un periódico digital optimizado para SEO, hecho en Salamanca: más lectores cada mes sin pagar anuncios.",
  lumiere:
    "Lumière llenaba los findes pero no entre semana ni salía en Google. Su web de restaurante con carta dinámica y SEO local en Salamanca: más reservas entre semana.",
  cenit:
    "Cenit gestionaba reservas en hojas de cálculo y WhatsApp. Le creamos un panel a medida en Salamanca: cero solapamientos y horas de gestión manual que desaparecen.",
  lumen:
    "Lumen, una clínica sin web propia, dependía de portales de terceros. Su web con cita online y SEO local en Salamanca: pacientes que la encuentran en Google.",
};

/** Busca un proyecto por su slug de URL. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/**
 * Proyecto anterior y siguiente en orden de listado, con vuelta circular
 * (el anterior del primero es el último). Devuelve `null` si no hay proyecto.
 */
export function getProjectNeighbors(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null };
  const prev =
    projects[(index - 1 + projects.length) % projects.length] ?? null;
  const next = projects[(index + 1) % projects.length] ?? null;
  return { prev, next };
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Llevábamos meses pagando comisiones que se comían el margen. Xync nos montó la tienda propia en menos tiempo del que esperábamos y desde el primer mes notamos la diferencia. Por fin vendemos sin depender de nadie.",
    author: "Carlos Mendoza",
    role: "Fundador · Grieta",
  },
  {
    quote:
      "Nos prometió que podríamos actualizar la carta nosotros solos sin llamar a nadie. Cumplió. Ahora cambiamos platos, precios y destacados en dos minutos desde el móvil. Y desde que salió la web nos llegan reservas de gente que nos encontró en Google.",
    author: "Sophie Arnaud",
    role: "Directora · Lumière",
  },
];

export const faqs: Faq[] = [
  {
    question: "¿Hacéis páginas web y tiendas online en Salamanca?",
    answer:
      "Sí. Xync es un estudio de desarrollo y diseño web freelance con base en Salamanca, fundado por Alejandro Martín Herrero. Diseñamos y programamos páginas web, tiendas online y productos digitales para autónomos, pymes y negocios locales de Salamanca y de toda España, y trabajamos en remoto con clientes de Latinoamérica. Nos especializamos en webs rápidas y orientadas a conversión con tecnologías modernas como Next.js, React y Medusa.js, e incluimos SEO técnico en cada proyecto para que tu web aparezca en Google desde el primer día. Trabajamos siempre con precio y plazo cerrados antes de empezar —una web suele estar lista en dos a cuatro semanas— así sabes exactamente qué recibes y cuándo. Si quieres crear, arreglar o rediseñar tu web o tu tienda online, escríbenos a contacto@xync.es y te respondemos en menos de 24 horas.",
  },
  {
    question: "¿Cómo creo una tienda online sin comisiones por venta?",
    answer:
      "Montando una tienda propia en lugar de vender solo en marketplaces o plataformas que cobran un porcentaje por cada venta. En Xync creamos tiendas online a medida —por ejemplo con Medusa.js— alojadas en tu propio dominio, donde cada pedido es tuyo y no pagas comisiones por transacción a un intermediario. Te la entregamos lista para vender, optimizada para Google y para el móvil, con precio y plazo cerrados. Es lo que hicimos con Grieta, que pasó de depender de marketplaces a vender directo desde su web.",
  },
  {
    question: "¿Cuánto tarda un proyecto?",
    answer:
      "Siempre con fecha cerrada antes de empezar. Una web suele estar lista en 2–4 semanas; te damos un plazo concreto tras nuestra primera conversación, según lo que necesites.",
  },
  {
    question: "¿Cuánto cuesta?",
    answer:
      "Trabajamos con presupuesto cerrado, no por horas: sabes el precio total antes de empezar. Cada proyecto es distinto, así que el número sale del plan que acordamos juntos, sin sorpresas después.",
  },
  {
    question: "¿Cuántas revisiones incluye?",
    answer:
      "Las necesarias dentro del alcance acordado. Trabajamos por fases y revisamos contigo en cada hito, así no llegamos al final con sorpresas ni con un resultado que no esperabas.",
  },
  {
    question: "¿Cómo nos comunicamos durante el proyecto?",
    answer:
      "Por donde te resulte cómodo (email, WhatsApp, Slack) y con un avance semanal. En todo momento sabes en qué punto está tu proyecto y qué viene después.",
  },
  {
    question: "¿Y si no quedo satisfecho?",
    answer:
      "Avanzamos por hitos: si algo no encaja, lo ajustamos antes de seguir. No cobramos la parte final hasta que el resultado funciona y estás conforme.",
  },
  {
    question: "¿Trabajáis en remoto?",
    answer:
      "Sí. Trabajamos desde Salamanca con clientes de toda España y de Latinoamérica en remoto. La distancia nunca ha sido un problema: lo que de verdad importa es la comunicación clara y los plazos cumplidos.",
  },
];
