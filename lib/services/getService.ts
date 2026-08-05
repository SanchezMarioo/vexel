import "server-only";
import { sanityFetch, SERVICES_CACHE_TAG } from "@/sanity/client";
import { isSanityConfigured } from "@/sanity/env";
import { SERVICE_BY_SLUG_QUERY } from "@/sanity/queries";
import type { SanityServiceFull } from "@/sanity/types";
import type { ServicePage } from "./mappers";
import { mapSanityService } from "./mappers";

export async function getService(slug: string, preview = false): Promise<ServicePage | null> {
  if (!isSanityConfigured) return null;

  try {
    const service = await sanityFetch<SanityServiceFull | null>({
      query: SERVICE_BY_SLUG_QUERY,
      params: { slug },
      preview,
      tags: [SERVICES_CACHE_TAG],
    });
    return service ? mapSanityService(service) : null;
  } catch (error) {
    console.error(`[services] Error leyendo "${slug}" de Sanity.`, error);
    return null;
  }
}
