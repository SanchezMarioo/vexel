import "server-only";
import { createClient, type QueryParams } from "next-sanity";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./env";

/**
 * Cliente Sanity del servidor. Dos modos:
 *
 * - published (por defecto): CDN + caché de Next con tag "blog". El webhook
 *   /api/revalidate/sanity invalida ese tag al publicar (ISR bajo demanda);
 *   las páginas además tienen revalidate horario como red de seguridad.
 * - drafts (Draft Mode): sin CDN ni caché, con token de lectura, para
 *   previsualizar borradores.
 */

export const BLOG_CACHE_TAG = "blog";

const token = process.env.SANITY_API_READ_TOKEN;

export const sanityClient = createClient({
  projectId: sanityProjectId || "placeholder",
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: true,
  perspective: "published",
  stega: { enabled: false },
});

const draftClient = createClient({
  projectId: sanityProjectId || "placeholder",
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: false,
  perspective: "drafts",
  token,
  stega: { enabled: false },
});

interface SanityFetchOptions {
  query: string;
  params?: QueryParams;
  /** true en Draft Mode: lee borradores sin caché. */
  preview?: boolean;
}

export async function sanityFetch<T>({
  query,
  params = {},
  preview = false,
}: SanityFetchOptions): Promise<T> {
  if (preview) {
    return draftClient.fetch<T>(query, params, { cache: "no-store" });
  }
  return sanityClient.fetch<T>(query, params, {
    next: { tags: [BLOG_CACHE_TAG] },
  });
}
