/**
 * Generates every app icon from scripts/source-icon.png.
 *
 * The source is an RGB image whose "transparent" corners are a painted
 * checkerboard, so we locate the rounded navy tile, crop it and mask its
 * corners for real. iOS and Android (maskable) get full-bleed versions,
 * because they apply their own corner masks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(scriptsDir, "..");
const source = path.join(scriptsDir, "source-icon.png");
const iconsDir = path.join(root, "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

/** Bounding box of the dark tile (the checkerboard is light gray/white). */
async function findTile(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * info.channels;
      const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (luminance < 110) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const size = Math.max(maxX - minX, maxY - minY) + 1;
  return { left: minX, top: minY, size };
}

/** Palette PNG: ~75% smaller than truecolor for this artwork. */
const PNG_OPTIONS = { palette: true, quality: 90, effort: 10, compressionLevel: 9 };

const tile = await findTile(source);
// Inset a little so anti-aliased checkerboard pixels on the edge are dropped.
const inset = Math.round(tile.size * 0.012);
const crop = {
  left: tile.left + inset,
  top: tile.top + inset,
  width: tile.size - inset * 2,
  height: tile.size - inset * 2,
};
const tileImage = await sharp(source).removeAlpha().extract(crop).png().toBuffer();
const tileSize = crop.width;

// Background color sampled from inside the tile, used for full-bleed icons.
const { data: sample } = await sharp(tileImage)
  .extract({ left: Math.round(tileSize * 0.08), top: Math.round(tileSize * 0.5), width: 1, height: 1 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const background = { r: sample[0], g: sample[1], b: sample[2], alpha: 1 };

const radius = Math.round(tileSize * 0.225);
const roundedMask = Buffer.from(
  `<svg width="${tileSize}" height="${tileSize}"><rect width="${tileSize}" height="${tileSize}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
);
const roundedTile = await sharp(tileImage)
  .ensureAlpha()
  .composite([{ input: roundedMask, blend: "dest-in" }])
  .png()
  .toBuffer();

/** Rounded tile with transparent corners (browsers, Android "any"). */
async function writeRounded(size, file) {
  await sharp(roundedTile).resize(size, size).png(PNG_OPTIONS).toFile(file);
}

/** Full-bleed square; `scale` shrinks the tile to keep content in the safe zone. */
async function writeFullBleed(size, file, scale = 1) {
  const inner = Math.round(size * scale);
  const content = await sharp(roundedTile).resize(inner, inner).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: content, gravity: "center" }])
    .flatten({ background })
    .png(PNG_OPTIONS)
    .toFile(file);
}

await writeRounded(512, path.join(root, "src/app/icon.png"));
await writeRounded(512, path.join(root, "public/icon.png"));
await writeRounded(192, path.join(iconsDir, "icon-192.png"));
await writeRounded(512, path.join(iconsDir, "icon-512.png"));
// iOS ignores transparency (it turns black) and rounds the corners itself.
await writeFullBleed(180, path.join(root, "src/app/apple-icon.png"));
await writeFullBleed(180, path.join(root, "public/apple-icon.png"));
// Android masks to a circle/squircle: keep the artwork inside the 80% safe zone.
await writeFullBleed(512, path.join(iconsDir, "icon-maskable-512.png"), 0.86);

console.log(
  `Icons generated from a ${tileSize}px tile (background rgb(${background.r}, ${background.g}, ${background.b})).`,
);
