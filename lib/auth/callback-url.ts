export function sanitizeCallbackUrl(value: string | undefined, fallback = "/cuenta") {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  if (normalizedValue.length > 2048) {
    return fallback;
  }

  if (!normalizedValue.startsWith("/")) {
    return fallback;
  }

  if (normalizedValue.startsWith("//") || normalizedValue.includes("\\")) {
    return fallback;
  }

  if (/[\u0000-\u001F\u007F]/.test(normalizedValue)) {
    return fallback;
  }

  try {
    const parsed = new URL(normalizedValue, "https://vexel.local");

    if (parsed.origin !== "https://vexel.local") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}