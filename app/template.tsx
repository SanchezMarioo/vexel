import type { ReactNode } from "react";

/**
 * Entrada de ruta global: template se remonta en cada navegación y reproduce
 * una animación 100% CSS (sin JS ni hidratación), así que nunca oculta contenido
 * más de un frame y `prefers-reduced-motion` la neutraliza vía el reset global.
 * Sin fill-mode forwards para no dejar transform residual que rompa sticky/fixed.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="route-enter">{children}</div>;
}
