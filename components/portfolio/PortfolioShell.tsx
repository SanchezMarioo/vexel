"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Portfolio surface wrapper. `.pf-root` scopes the light swiss theme (see
 * globals.css) and MotionConfig makes every framer-motion animation respect
 * the user's prefers-reduced-motion setting.
 *
 * LazyMotion + `m` (en lugar de `motion`) recorta ~30 kb de bundle cargando
 * solo las features de animación DOM. `strict` hace que usar `motion.*` por
 * error lance en desarrollo, para que el ahorro no se pierda sin darnos cuenta.
 */
export default function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <div className="pf-root">{children}</div>
      </LazyMotion>
    </MotionConfig>
  );
}
