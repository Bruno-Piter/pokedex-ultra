import { SPRITE_FLAGS } from "@/lib/data/catalog";

const SPRITE_CDN =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export type SpriteStyle = "artwork" | "pixel";
type SpriteKind = "artwork" | "home" | "pixel";

export function getSpriteUrl(id: number, kind: SpriteKind, shiny = false): string {
  const shinyPath = shiny ? "shiny/" : "";
  if (kind === "artwork") return `${SPRITE_CDN}/other/official-artwork/${shinyPath}${id}.png`;
  if (kind === "home") return `${SPRITE_CDN}/other/home/${shinyPath}${id}.png`;
  return `${SPRITE_CDN}/${shinyPath}${id}.png`;
}

export type SpriteAttempt = {
  src: string;
  /** Load straight from GitHub instead of through the Next image optimizer. */
  unoptimized: boolean;
  pixel: boolean;
};

const FLAG_BY_KIND: Record<SpriteKind, { normal: number; shiny: number }> = {
  artwork: { normal: SPRITE_FLAGS.artwork, shiny: SPRITE_FLAGS.artworkShiny },
  home: { normal: SPRITE_FLAGS.home, shiny: SPRITE_FLAGS.homeShiny },
  pixel: { normal: SPRITE_FLAGS.pixel, shiny: SPRITE_FLAGS.pixelShiny },
};

/**
 * Ordered list of images to try. Optimized artwork falls back to the raw
 * GitHub URL (covers optimizer errors or quota limits), then to other sprite
 * kinds. `flags` (from the catalog) skips images PokéAPI doesn't have.
 */
export function getSpriteAttempts(
  id: number,
  style: SpriteStyle,
  { shiny = false, flags }: { shiny?: boolean; flags?: number } = {},
): SpriteAttempt[] {
  const order: SpriteKind[] =
    style === "pixel" ? ["pixel", "artwork", "home"] : ["artwork", "home", "pixel"];

  const build = (wantShiny: boolean) =>
    order
      .filter((kind) => {
        if (flags === undefined) return true;
        const flag = wantShiny ? FLAG_BY_KIND[kind].shiny : FLAG_BY_KIND[kind].normal;
        return (flags & flag) !== 0;
      })
      .flatMap((kind): SpriteAttempt[] => {
        const src = getSpriteUrl(id, kind, wantShiny);
        if (kind === "pixel") return [{ src, unoptimized: true, pixel: true }];
        return [
          { src, unoptimized: false, pixel: false },
          { src, unoptimized: true, pixel: false },
        ];
      });

  const attempts = build(shiny);
  return attempts.length > 0 || !shiny ? attempts : build(false);
}
