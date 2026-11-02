import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skinmatch",
    short_name: "Skinmatch",
    description: "Your skincare routine, checked by AI.",
    start_url: "/routine",
    display: "standalone",
    background_color: "#FBF7F4",
    theme_color: "#FBF7F4",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
