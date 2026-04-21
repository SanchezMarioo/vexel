import "server-only";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Type guard that checks whether a value is a valid UUID v4 string.
 */
export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Asserts that a value is a valid UUID and returns it typed as `string`.
 * Throws a descriptive error if validation fails.
 */
export function assertUuid(value: unknown, label = "ID"): string {
  if (!isValidUuid(value)) {
    throw new Error(`${label} no es un UUID válido.`);
  }

  return value;
}
