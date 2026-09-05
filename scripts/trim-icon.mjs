import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(__dirname, "source-icon.png");
const iconsDir = path.join(root, "public", "icons");

fs.mkdirSync(iconsDir, { recursive: true });

const trimmed = sharp(source).trim({ threshold: 15 });

await trimmed.clone().png().toFile(path.join(root, "src/app/icon.png"));
await trimmed
  .clone()
  .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(root, "src/app/apple-icon.png"));
await trimmed
  .clone()
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(root, "public/icon.png"));
await trimmed
  .clone()
  .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(iconsDir, "icon-192.png"));
await trimmed
  .clone()
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(iconsDir, "icon-512.png"));

console.log(
  "Icons generated: src/app/icon.png, src/app/apple-icon.png, public/icon.png, public/icons/icon-192.png, public/icons/icon-512.png",
);