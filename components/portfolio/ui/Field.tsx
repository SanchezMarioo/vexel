import type { UseFormRegisterReturn } from "react-hook-form";

interface FieldProps {
  id: string;
  label: string;
  field: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  rows?: number;
}

export default function Field({
  id,
  label,
  field,
  error,
  hint,
  required = false,
  multiline = false,
  type = "text",
  placeholder,
  autoComplete,
  rows = 5,
}: FieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined;

  const controlClasses = `w-full rounded-[var(--pf-radius)] border bg-pf-surface px-4 py-3 text-pf-ink placeholder:text-pf-muted transition-colors duration-200 ${
    error
      ? "border-[oklch(0.6_0.2_27)]"
      : "border-pf-line hover:border-pf-line-strong"
  }`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="pf-mono text-xs uppercase tracking-wide text-pf-ink">
        {label}
        {required ? <span className="text-pf-violet-700"> *</span> : null}
      </label>

      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${controlClasses} resize-y`}
          {...field}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={controlClasses}
          {...field}
        />
      )}

      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-pf-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-[oklch(0.47_0.2_27)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
