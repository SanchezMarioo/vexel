import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";

/**
 * Studio embebido en /studio. Sin credenciales en código: projectId/dataset
 * vienen de las variables de entorno públicas (ver .env.example).
 */
export default defineConfig({
  name: "xync-blog",
  title: "Xync · Blog",
  basePath: "/studio",
  projectId: sanityProjectId || "placeholder",
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
