import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pokédex Ultra",
    short_name: "Pokédex",
    description:
      "A modern Pokédex powered by PokéAPI — explore Pokémon, stats, evolutions, and more.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#161616",
    theme_color: "#161616",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}