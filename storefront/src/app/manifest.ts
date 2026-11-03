import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CrunchIt",
    short_name: "CrunchIt",
    description: "A focused workspace for converting your images.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b151b",
    theme_color: "#0b151b",
    icons: [
      { src: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
