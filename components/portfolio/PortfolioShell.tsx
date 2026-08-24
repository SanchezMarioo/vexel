import type { ReactNode } from "react";

export default function PortfolioShell({ children }: { children: ReactNode }) {
  return <div className="pf-root">{children}</div>;
}
