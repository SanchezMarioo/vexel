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
  title: string;
  sector: string;
  /** El problema de negocio que tenía el cliente. */
  problem: string;
  /** Qué se construyó. */
  built: string;
  /** Qué resultado tuvo (medible si es posible). */
  result: string;
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
    "Desarrollo la web y el producto digital que tu negocio necesita para crecer.",
  subhead:
    "¿Tu web va lenta, no convierte o se quedó a medias? La dejo rápida, clara y lista para vender — con plazos cerrados que se cumplen.",
  availability: "Disponible para nuevos proyectos · Junio 2026",
  responseTime: "Respondo en menos de 24 h",
  location: "Salamanca, Castilla y León",
  email: "xyncdev@gmail.com",
  calUrl: "xync-ulzw2t/15min",
  socials: [
    { label: "Discord", href: "https://discord.gg/aENy8Sb4rS" },
    { label: "TikTok", href: "https://www.tiktok.com/@xyncdev" },
  ],
};

export const navLinks: NavLink[] = [
  { label: "Servicios", href: "#servicios" },
  { label: "Cómo trabajo", href: "#proceso" },
  { label: "Proyectos", href: "#proyectos" },
];

export const services: Service[] = [
  {
    id: "construir",
    title: "Tu producto en internet, rápido y sin fallos",
    description:
      "Construyo desde cero la web o la aplicación de tu negocio: fácil de usar, que carga al instante en el móvil y lista para empezar a vender.",
    result: "Un producto en marcha, medible y preparado para crecer.",
    audience: "Para fundadores que lanzan algo nuevo.",
  },
  {
    id: "arreglar",
    title: "Tu web actual, arreglada y puesta a punto",
    description:
      "Reparo lo que va lento, falla o frena las ventas, y dejo tu web mantenible para que no vuelva a romperse cada dos por tres.",
    result:
      "Menos errores, más velocidad y más clientes que terminan comprando.",
    audience: "Para negocios con una web que se quedó corta.",
  },
  {
    id: "rediseñar",
    title: "Una imagen a la altura de tu producto",
    description:
      "Rediseño la interfaz para que tu producto se vea profesional y se entienda en segundos, sin perder a nadie por el camino.",
    result: "Una experiencia clara que genera confianza y convierte mejor.",
    audience: "Para equipos que necesitan dar el salto de calidad.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Hablamos de tu objetivo",
    you: "Me cuentas qué necesitas y qué sería un éxito para ti.",
    me: "Te digo con franqueza si puedo ayudarte y cómo lo enfocaría.",
    when: "En la primera llamada, sin coste.",
  },
  {
    title: "Te paso un plan y un precio cerrado",
    you: "Revisas alcance, plazo y precio. Sin letra pequeña.",
    me: "Dejo por escrito qué se entrega y cuándo.",
    when: "En 48 h tras hablar.",
  },
  {
    title: "Construyo y te enseño avances",
    you: "Ves el progreso en cada hito y das tu opinión.",
    me: "Desarrollo por fases y te muestro resultados reales, no promesas.",
    when: "Cada semana.",
  },
  {
    title: "Lanzamos y te dejo todo en orden",
    you: "Recibes tu producto funcionando, listo para usar.",
    me: "Me aseguro de que vaya rápido, sin errores y fácil de mantener.",
    when: "En la fecha que acordamos.",
  },
];

export const projects: Project[] = [
  {
    id: "proyecto-1",
    title: "PROYECTO 1 — Grieta",
    sector: "Ecommerce online",
    problem:
      "Vendían en marketplaces de terceros pagando comisiones altas y sin visibilidad propia en Google. Cada venta dependía de la plataforma, no de ellos.",
    built:
      "Tienda propia con Medusa.js — rápida, con cada producto optimizado para aparecer en buscadores y sin intermediarios que se lleven parte de cada venta.",
    result:
      "Más ventas directas, menos comisiones y clientes que llegan solos desde Google.",
    liveUrl: "https://grieta.xync.es/",
    image: {
      src: "/portfolio/hero-image.webp",
      alt: "Tienda online Grieta",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-2",
    title: "PROYECTO 2 — The Byte",
    sector: "Periódico digital",
    problem:
      "Publicaban buen contenido que nadie leía. No aparecían en Google y cada artículo nuevo requería ayuda técnica para subirse.",
    built:
      "Periódico digital donde la redacción publica de forma autónoma y cada artículo está construido para posicionarse y atraer lectores desde el primer día.",
    result:
      "Más lectores mes a mes sin pagar publicidad, solo con contenido que Google encuentra y recomienda.",
    liveUrl: "https://thebyte.xync.es/",
    image: {
      src: "/portfolio/proyecto-2.webp",
      alt: "Periódico digital The Byte",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-3",
    title: "PROYECTO 3 — Lumière",
    sector: "Restaurante",
    problem:
      "Llenos los fines de semana pero vacíos entre semana. No aparecían cuando alguien buscaba en Google dónde comer cerca.",
    built:
      "Web con carta dinámica que el restaurante actualiza solo, optimizada para aparecer en búsquedas locales y mostrar la carta directamente en Google.",
    result:
      "Más reservas entre semana y nuevos clientes que llegan directamente desde el buscador.",
    liveUrl: "https://lumiere.xync.es/",
    image: {
      src: "/portfolio/proyecto-3.webp",
      alt: "Web del restaurante Lumière con carta dinámica",
      width: 1600,
      height: 1000,
    },
  },
];

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
    question: "¿Cuánto tarda un proyecto?",
    answer:
      "Siempre con fecha cerrada antes de empezar. Una web suele estar lista en 2–4 semanas; te doy un plazo concreto tras nuestra primera conversación, según lo que necesites.",
  },
  {
    question: "¿Cuánto cuesta?",
    answer:
      "Trabajo con presupuesto cerrado, no por horas: sabes el precio total antes de empezar. Cada proyecto es distinto, así que el número sale del plan que acordamos juntos, sin sorpresas después.",
  },
  {
    question: "¿Cuántas revisiones incluye?",
    answer:
      "Las necesarias dentro del alcance acordado. Trabajo por fases y reviso contigo en cada hito, así no llegamos al final con sorpresas ni con un resultado que no esperabas.",
  },
  {
    question: "¿Cómo nos comunicamos durante el proyecto?",
    answer:
      "Por donde te resulte cómodo (email, WhatsApp, Slack) y con un avance semanal. En todo momento sabes en qué punto está tu proyecto y qué viene después.",
  },
  {
    question: "¿Y si no quedo satisfecho?",
    answer:
      "Avanzamos por hitos: si algo no encaja, lo ajustamos antes de seguir. No cobro la parte final hasta que el resultado funciona y estás conforme.",
  },
  {
    question: "¿Trabajas en remoto?",
    answer:
      "Sí. Trabajo desde Salamanca con clientes de toda España y de Latinoamérica en remoto. La distancia nunca ha sido un problema: lo que de verdad importa es la comunicación clara y los plazos cumplidos.",
  },
];
