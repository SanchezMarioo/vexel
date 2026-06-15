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
  email: string;
  /** Cal.com link slug: "usuario/30min" — sin dominio. */
  calUrl: string;
  socials: SocialLink[];
}

export const identity: Identity = {
  name: "Vexel",
  headline: "Desarrollo la web y el producto digital que tu negocio necesita para crecer.",
  subhead:
    "¿Tu web va lenta, no convierte o se quedó a medias? La dejo rápida, clara y lista para vender — con plazos cerrados que se cumplen.",
  availability: "Disponible para nuevos proyectos · Junio 2026",
  responseTime: "Respondo en menos de 24 h",
  email: "vexel2k26@gmail.com ",
  calUrl: "vexel-va8ijl/hablamos-15-minutos",
  socials: [
    { label: "Discord", href: "https://discord.gg/aENy8Sb4rS" },
    { label: "GitHub", href: "https://github.com/[usuario]" },
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
    result: "Menos errores, más velocidad y más clientes que terminan comprando.",
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
    title: "[PROYECTO 1 — Nombre]",
    sector: "[Sector — p.ej. tienda de moda online]",
    problem:
      "[El problema de negocio: p.ej. la web cargaba lenta y perdían ventas en el móvil.]",
    built:
      "[Qué construiste: p.ej. una tienda nueva, optimizada para móvil y fácil de gestionar.]",
    result: "[Resultado medible: p.ej. +38% de ventas online en 3 meses.]",
    liveUrl: "https://[enlace-en-vivo.com]",
    image: {
      src: "/portfolio/proyecto-1.jpg",
      alt: "[Captura del proyecto 1 para lectores de pantalla]",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-2",
    title: "[PROYECTO 2 — Nombre]",
    sector: "[Sector — p.ej. plataforma de reservas]",
    problem: "[Qué frenaba al negocio antes de empezar.]",
    built: "[Qué se construyó o se mejoró, en lenguaje de cliente.]",
    result: "[El resultado o cambio que notó el cliente.]",
    liveUrl: "https://[enlace-en-vivo.com]",
    image: {
      src: "/portfolio/proyecto-2.jpg",
      alt: "[Captura del proyecto 2]",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "proyecto-3",
    title: "[PROYECTO 3 — Nombre]",
    sector: "[Sector]",
    problem: "[El problema. Si tienes pocos casos, prioriza el mejor contado.]",
    built: "[Qué entregaste.]",
    result: "[El impacto.]",
    liveUrl: "https://[enlace-en-vivo.com]",
    image: {
      src: "/portfolio/proyecto-3.jpg",
      alt: "[Captura del proyecto 3]",
      width: 1600,
      height: 1000,
    },
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "[Cita real de un cliente: qué resultado consiguió y cómo fue trabajar contigo. Lo más potente es lo concreto — una cifra, un plazo cumplido, un problema resuelto.]",
    author: "[Nombre]",
    role: "[Cargo · Empresa]",
  },
  {
    quote:
      "[Segunda cita. Evita el genérico “muy profesional”: busca el detalle que solo alguien que trabajó contigo diría.]",
    author: "[Nombre]",
    role: "[Cargo · Empresa]",
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
      "Sí, con clientes de [España y LATAM]. La distancia nunca ha sido un problema: lo que de verdad importa es la comunicación clara y los plazos cumplidos.",
  },
];
