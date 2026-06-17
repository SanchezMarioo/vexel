export function sanitizeCallbackUrl(value: string | undefined, fallback = "/") {
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
    const parsed = new URL(normalizedValue, "https://xync.local");

    if (parsed.origin !== "https://xync.local") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function resolveAuthRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/")) {
    return sanitizeCallbackUrl(value, fallback);
  }

  try {
    const parsed = new URL(value);
    return sanitizeCallbackUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`, fallback);
  } catch {
    return fallback;
  }
}
