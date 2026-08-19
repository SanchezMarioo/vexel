interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  hasFilters?: boolean;
}

export function EmptyState({
  title = "No se encontraron leads",
  description = "No hay leads que coincidan con los filtros aplicados actualmente.",
  onReset,
  hasFilters = false,
}: EmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center border border-dashed border-white/10 rounded-xl bg-[#080808]/50 my-6">
      <div
        aria-hidden="true"
        className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      <h3 className="text-sm font-semibold text-white/90 mb-1 pf-display">{title}</h3>
      <p className="text-xs text-white/50 max-w-sm mx-auto pf-mono leading-relaxed mb-4">
        {description}
      </p>

      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors pf-mono cursor-pointer"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
