import "server-only";
import { cache } from "react";
import { sanityFetch, SERVICES_CACHE_TAG } from "@/sanity/client";
import { isSanityConfigured } from "@/sanity/env";
import { SERVICES_QUERY } from "@/sanity/queries";
import type { SanityServiceCard } from "@/sanity/types";
import { mapSanityServiceCard } from "./mappers";

export const getServices = cache(async function getServices(preview = false) {
  if (!isSanityConfigured) return [];

  try {
    const services = await sanityFetch<SanityServiceCard[]>({
      query: SERVICES_QUERY,
      preview,
      tags: [SERVICES_CACHE_TAG],
    });
    return services.map(mapSanityServiceCard);
  } catch (error) {
    console.error("[services] Error listando páginas de servicio de Sanity.", error);
    return [];
  }
});
