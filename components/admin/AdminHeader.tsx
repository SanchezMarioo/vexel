import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface AdminHeaderProps {
  adminEmail: string;
  adminName?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AdminHeader({ adminEmail, breadcrumbs }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Marca y Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Link
          href="/"
          className="pf-display text-lg font-bold text-white tracking-tight hover:opacity-80 transition-opacity flex-shrink-0"
        >
          Xync<span className="text-white">.</span>
        </Link>

        <span className="text-white/20">/</span>

        <Link
          href="/admin/leads"
          className="text-xs pf-mono font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <span>Leads</span>
        </Link>

        {breadcrumbs &&
          breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2 min-w-0">
              <span className="text-white/20">/</span>
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-xs pf-mono text-white/60 hover:text-white truncate transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-xs pf-mono text-white/90 truncate font-semibold">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
      </div>

      {/* Controles de la derecha */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <a
          href="/empezar"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1 text-[11px] pf-mono text-white/50 hover:text-white transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5"
          title="Abrir el funnel público en nueva pestaña"
        >
          <span>Ver /empezar</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        <span className="text-[11px] pf-mono text-white/50 hidden lg:inline-block truncate max-w-[160px]">
          {adminEmail}
        </span>

        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-7 h-7 border border-white/20 hover:border-white/40 transition-colors",
            },
          }}
        />
      </div>
    </header>
  );
}
