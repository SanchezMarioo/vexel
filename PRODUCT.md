# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fundadores, autónomos y dueños de negocio (pymes, comercio local) que necesitan crear, arreglar o rediseñar su web o tienda online. El usuario del funnel llega ya convencido tras ver /proyectos, con intención real de contratar pero sin querer comprometerse de golpe: quiere sentir que habla con alguien capaz, no que rellena un trámite. Audiencia secundaria: visitantes que prefieren el contacto directo (email / formulario clásico), que se mantiene disponible.

## Product Purpose

Xync es un estudio freelance de diseño y desarrollo web (2 personas) con base en Salamanca. El sitio vende sus servicios: webs, tiendas online y productos digitales. El funnel de captación existe para convertir visitantes interesados en leads cualificados y, como conversión final, que reserven una llamada vía Cal.com. Éxito = lead cualificado con contexto completo (tipo de proyecto, inversión, plazo, problema) + llamada reservada.

## Positioning

Precio y plazo cerrados antes de empezar — el mecanismo que un estudio que cobra por horas no puede copiar con verdad. Copy orientado al problema del cliente, no a la tecnología. Proyectos reales con URLs en vivo y resultados de negocio. Estudio pequeño y cercano: respuesta el mismo día, franqueza sobre si pueden ayudar o no.

## Operating Context

- Next.js 16 (App Router) + Tailwind CSS 4 + framer-motion + react-hook-form/zod.
- Cal.com embebido con carga diferida (`CalButton`, namespace `book`).
- Blog en Sanity CMS. Analítica Vercel.
- Leads actuales: `/api/contact` → webhook Google Apps Script → Google Sheets (claves `nombre`/`email`/`descripcion`), con rate limiting por IP y honeypot.
- RGPD: consentimiento explícito obligatorio antes de tratar datos; páginas legales en `/aviso-legal`, `/privacidad`, `/cookies`.
- Titular legal: Alejandro Martín Herrero (marca pública: Xync). Idioma: es-ES.

## Capabilities and Constraints

- El funnel vive en una RUTA NUEVA dedicada (ej. `/empezar`); el formulario clásico de `#contacto` en la landing se mantiene como vía directa. Confirmado.
- La cualificación del funnel mide cuatro ejes (confirmado): tipo de proyecto, presupuesto/inversión, plazo/urgencia, situación actual/problema.
- ABIERTO — destino de los leads estructurados del funnel: hoy Google Sheets vía webhook; se está valorando migrar (posiblemente Resend/email u otro). No inventar destino definitivo; la implementación debe aislar la entrega para poder cambiarla.
- ABIERTO — evento Cal.com del funnel: el brief pide llamada de 20 min; el evento configurado hoy es de 15 min (`xync-ulzw2t/15min`). Confirmar slug/duración antes de implementar la conversión final.
- El funnel debe respetar RGPD (consentimiento explícito antes del envío) y las medidas anti-spam existentes (honeypot, rate limit).
- Qualificación negativa: si un lead no encaja, el flujo debe responder con honestidad y una vía alternativa — nunca un rechazo frío ni un callejón sin salida.

## Brand Commitments

- Voz: directa, sin jerga, orientada al problema del cliente; tuteo; sin tecnicismos innecesarios. Franqueza como rasgo de marca ("te decimos con franqueza si podemos ayudarte").
- Sistema visual vigente (confirmado como base, no sustituir): blanco y negro total, chroma 0, tipografía display Bricolage Grotesque + Geist Sans/Mono. El funnel debe usar o extender los tokens existentes, no crear una identidad paralela.
- Motion vigente: curvas ease-out exponenciales, sin bounce, `prefers-reduced-motion` respetado globalmente.
- Servicios publicados (content.ts): construir desde cero, arreglar/puesta a punto, rediseño — los tres con resultado y audiencia definidos.

## Evidence on Hand

- 5 proyectos reales con URL en vivo: Grieta, The Byte, Lumière, Cenit, Lumen (`lib/portfolio/content.ts`, imágenes en `/public/portfolio/`).
- 2 testimonios reales (Carlos Mendoza · Grieta, Sophie Arnaud · Lumière).
- FAQ real orientada a objeciones (precio, plazo, revisiones, comunicación, satisfacción, remoto).
- Datos legales/NAP reales en `legalEntity`.
- Ausencias que NO se deben fabricar: cifras de resultados no publicadas, testimonios adicionales, logos de clientes, precios concretos de servicios.

## Product Principles

1. Cada pantalla reduce la sensación de esfuerzo, nunca la aumenta.
2. Se habla del problema del cliente, no de la tecnología.
3. Franqueza: decir si se puede ayudar y cómo; la cualificación se comunica como criterio honesto, no como filtro frío.
4. Precio y plazo cerrados: sin sorpresas, sin letra pequeña.
5. Cercanía premium: estudio pequeño y capaz; el proceso se siente como hablar con alguien, no como un trámite.

## Accessibility & Inclusion

- `prefers-reduced-motion` ya respetado por el sistema (MotionConfig + reset CSS); el funnel debe mantenerlo.
- Flujo utilizable sin JS degradado de forma legible (patrón ya existente en el portfolio).
- Consentimiento RGPD explícito y accesible en el punto de captura de datos.
