/**
 * Configuración de entorno de Sanity, en un solo lugar.
 *
 * Si falta projectId o dataset, el sitio NO se rompe: la capa de datos
 * (lib/blog/*) cae al contenido local de lib/content/blog.ts y el Studio
 * muestra un aviso en vez de arrancar mal. Esto permite builds de CI y
 * desarrollo local sin credenciales.
 */

function assertValue<T>(value: T | undefined): T {
  if (value === undefined || value === "") {
    throw new Error("Falta la variable de entorno de Sanity requerida");
  }
  return value;
}

export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01";

/** true solo si hay credenciales mínimas para hablar con Sanity. */
export const isSanityConfigured = sanityProjectId !== "" && sanityDataset !== "";

/** Studio y cliente estricto (solo se llama cuando isSanityConfigured). */
export function requireSanityEnv(): { projectId: string; dataset: string; apiVersion: string } {
  return {
    projectId: assertValue(sanityProjectId),
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
  };
}
export const projectId = sanityProjectId;
export const dataset = sanityDataset;
export const apiVersion = sanityApiVersion;
