---
version: 1
slug: "app-empezar-page-tsx"
primary_target: "app/empezar/page.tsx"
related_targets: ["components/funnel/Funnel.tsx"]
---

# Surface brief — /empezar (funnel de captación)

## Scope and mode
Ruta nueva dedicada: funnel conversacional de captación. Modo: Operate (el visitante completa una tarea de cualificación + reserva; la persuasión vive en el copy, no en la expresión visual). Complementa al formulario clásico de /#contacto, que se mantiene.

## Audience, job, action
Fundador ya convencido tras ver /proyectos, con intención real de contratar pero sin querer comprometerse de golpe. Tarea: contar su caso en ~2 minutos y reservar una llamada vía Cal.com. Éxito = lead cualificado (tipo de proyecto, inversión, plazo, problema) + llamada reservada.

## Direction chosen
Transcripción acumulada: una columna, una pregunta activa cada vez; lo respondido queda visible arriba como registro editable (el registro ES el progreso — sin barras). Eje vertical único en transiciones (~400ms, pfEaseOut). Cierre invertido (pf-invert, negro) = resumen + cualificación honesta + Cal.com. Pregunta activa en Bricolage Grotesque grande; opciones como líneas tipográficas completas con hairlines (sin cards); inputs sin borde, hairline inferior. Contador mono discreto + frase de tramo.

## Memorable moment
La compresión del registro: al responder, la pregunta se pliega hacia arriba y queda como prueba de que Xync recuerda lo que le cuentas; tocar cualquier respuesta pasada vuelve a ese punto.

## Constraints
- Sistema pf-* chroma 0 heredado; ningún color nuevo; sin cards, glass, gradientes, typing indicators ni teatro de chat.
- RGPD: consentimiento explícito junto al email; honeypot + rate limit como en /api/contact.
- Entrega del lead aislada en un módulo (Sheets hoy; Resend pendiente de decidir). Evento Cal.com pendiente de confirmar (hoy xync-ulzw2t/15min vía identity.calUrl).
- Reduced motion: sustitución instantánea de pasos. Sin JS: fallback estático con email directo.

## Open decisions
- Rangos de presupuesto (propuestos, ajustables) y posible umbral de cualificación negativa.
- Destino final del lead y evento Cal.com de 20 min.
