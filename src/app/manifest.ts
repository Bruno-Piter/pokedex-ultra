import type { MetadataRoute } from "next";
import { THEME_COLORS } from "@/lib/theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pokédex Ultra",
    short_name: "Pokédex",
    description:
      "A fast, offline-ready Pokédex — stats, moves by game, evolutions and type matchups for every Pokémon.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone"],
    orientation: "any",
    background_color: THEME_COLORS.dark,
    theme_color: THEME_COLORS.dark,
    categories: ["games", "entertainment", "reference"],
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
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
