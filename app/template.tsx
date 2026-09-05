import type { ReactNode } from "react";

/**
 * Entrada de ruta global: se renderizan los hijos directamente sin wrappers de
 * opacidad artificial (`opacity: 0`) ni animaciones bloqueantes, garantizando
 * FCP inmediato y evitando fallos de NO_FCP en entornos lentos o navegadores headless.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
