/**
 * Sanitización de seguridad contra inyección de fórmulas en hojas de cálculo (CWE-1236 / CSV Injection).
 * Si un valor comienza con =, +, -, @, \t o \r, se antepone una comilla simple (')
 * para que motores como Google Sheets, Microsoft Excel o LibreOffice Calc
 * lo interpreten como texto plano y no como una expresión ejecutable.
 */
export function sanitizeSpreadsheetFormula(value: string | null | undefined): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const dangerousPrefixes = ["=", "+", "-", "@", "\t", "\r", "|", "%"];
  const firstChar = trimmed.charAt(0);

  if (dangerousPrefixes.includes(firstChar)) {
    return `'${trimmed}`;
  }

  return trimmed;
}

/**
 * Sanitiza texto eliminando caracteres de control no imprimibles y neutralizando prefijos de fórmulas.
 */
export function sanitizeTextForStorage(value: string | null | undefined): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  // Eliminar caracteres de control no imprimibles
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  return sanitizeSpreadsheetFormula(cleaned);
}
