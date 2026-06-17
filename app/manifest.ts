import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Xync — Desarrollador web freelance",
    short_name: "Xync",
    description:
      "Desarrollo y mejoro la web y el producto digital de tu negocio: rápido, sin fallos y con plazos cerrados.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
