"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";

/**
 * Studio embebido en /studio. Sin variables de entorno no arranca el CMS:
 * muestra un aviso en vez de fallar con un error opaco (builds de CI, clones
 * locales sin credenciales).
 */
export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-neutral-900">
        <h1 className="text-2xl font-semibold">Studio de Sanity no configurado</h1>
        <p className="max-w-md text-sm text-neutral-600">
          Define <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> y{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code> en <code>.env.local</code> para
          activar el Studio (ver <code>.env.example</code>).
        </p>
      </main>
    );
  }

  return <NextStudio config={config} history="hash" />;
}
