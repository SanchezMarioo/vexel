"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Portfolio surface wrapper. `.pf-root` scopes the light swiss theme (see
 * globals.css) and MotionConfig makes every framer-motion animation respect
 * the user's prefers-reduced-motion setting.
 */
export default function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="pf-root">{children}</div>
    </MotionConfig>
  );
}
