import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pub = resolve(root, "public");
const brand = resolve(pub, "brand");
const requireFromNext = createRequire(import.meta.resolve("next/package.json"));
const sharp = requireFromNext("sharp");

const vectorCopies = [
  ["brand/app-icon.svg", "favicon.svg"],
  ["brand/mark-fill-black.svg", "logo-mark-fill-black.svg"],
  ["brand/mark-fill-white.svg", "logo-mark-fill-white.svg"],
  ["brand/mark-outline-black.svg", "logo-mark-outline-black.svg"],
  ["brand/mark-outline-white.svg", "logo-mark-outline-white.svg"],
  ["brand/wordmark-light.svg", "logo-wordmark-light.svg"],
  ["brand/wordmark-dark.svg", "logo-wordmark-dark.svg"],
  ["brand/banner-light.svg", "banner-light.svg"],
  ["brand/banner-dark.svg", "banner-dark.svg"],
  ["brand/banner-sq-dark.svg", "banner-sq-dark.svg"],
];

await mkdir(brand, { recursive: true });
for (const [source, target] of vectorCopies) {
  await copyFile(resolve(pub, source), resolve(pub, target));
}

async function raster(source, target, width, format) {
  await sharp(await readFile(resolve(pub, source)))
    .resize(width, width === 1200 ? Math.round(width * 630 / 1200) : undefined)
    .toFormat(format, format === "webp" ? { quality: 88, effort: 6 } : {})
    .toFile(resolve(pub, target));
}

for (const format of ["png", "webp"]) {
  await raster("brand/app-icon.svg", `icon-192.${format}`, 192, format);
  await raster("brand/app-icon.svg", `icon-512.${format}`, 512, format);
  await raster("brand/app-icon.svg", `maskable-icon-512.${format}`, 512, format);
  await raster("brand/wordmark-light.svg", `logo-wordmark-light.${format}`, 430, format);
  await raster("brand/wordmark-dark.svg", `logo-wordmark-dark.${format}`, 430, format);
  await raster("brand/banner-light.svg", `banner-light.${format}`, 1200, format);
  await raster("brand/banner-dark.svg", `banner-dark.${format}`, 1200, format);
  await raster("brand/banner-sq-dark.svg", `banner-sq-dark.${format}`, 630, format);
}

await sharp(await readFile(resolve(pub, "brand/app-icon.svg")))
  .resize(180, 180)
  .png()
  .toFile(resolve(pub, "apple-touch-icon.png"));

const faviconPng = await sharp(await readFile(resolve(pub, "brand/app-icon.svg")))
  .resize(48, 48)
  .png()
  .toBuffer();
const iconDirectory = Buffer.alloc(22);
iconDirectory.writeUInt16LE(0, 0); // reserved
iconDirectory.writeUInt16LE(1, 2); // ICO resource
iconDirectory.writeUInt16LE(1, 4); // one PNG-backed icon
iconDirectory.writeUInt8(48, 6);
iconDirectory.writeUInt8(48, 7);
iconDirectory.writeUInt8(0, 8);
iconDirectory.writeUInt8(0, 9);
iconDirectory.writeUInt16LE(1, 10);
iconDirectory.writeUInt16LE(32, 12);
iconDirectory.writeUInt32LE(faviconPng.length, 14);
iconDirectory.writeUInt32LE(iconDirectory.length, 18);
await writeFile(resolve(pub, "favicon.ico"), Buffer.concat([iconDirectory, faviconPng]));

console.log("Generated Lapis SVG, PNG, WebP, Apple touch, and favicon assets.");
