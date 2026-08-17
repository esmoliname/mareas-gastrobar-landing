// Re-codifica las imágenes embebidas de los GLBs externos a WebP (máx 2048px,
// q80) y re-empaqueta el GLB. Las texturas son el 90% del peso de estos
// modelos (seafood ~11.8 MB, beer ~8.4 MB, lantern ~8.9 MB). Uso:
// node scripts/compress-textures.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { modelCatalog } from "../src/data/models3d.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS = resolve(ROOT, "public", "models");
const EXTERNAL = ["pizza", "cocktail", "antojos", "burger", "seafood", "grill", "beer", "dessert", "fruit", "lantern"];

function readGlb(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("not a GLB");
  let off = 12;
  const chunks = [];
  while (off < buf.length) {
    const len = buf.readUInt32LE(off);
    const type = buf.readUInt32LE(off + 4);
    chunks.push({ type, data: buf.subarray(off + 8, off + 8 + len) });
    off += 8 + len;
  }
  return chunks;
}

function writeGlb(path, chunks) {
  let total = 12;
  const parts = [];
  for (const c of chunks) {
    const head = Buffer.alloc(8);
    head.writeUInt32LE(c.data.length, 0);
    head.writeUInt32LE(c.type, 4);
    parts.push(head, c.data);
    total += 8 + c.data.length;
  }
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(total, 8);
  writeFileSync(path, Buffer.concat([header, ...parts]));
}

function reencode(imgBytes) {
  return sharp(imgBytes)
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

for (const key of EXTERNAL) {
  const src = resolve(MODELS, `${key}.glb`);
  const before = statSync(src).size;
  const chunks = readGlb(src);
  const jsonChunk = chunks.find((c) => c.type === 0x4e4f534a);
  const binChunk = chunks.find((c) => c.type === 0x004e4942);
  if (!binChunk) {
    console.log(`${key}: sin chunk BIN, no aplica`);
    continue;
  }
  const json = JSON.parse(jsonChunk.data.toString("utf8"));
  const bin = binChunk.data;
  const buffers = json.buffers || [];
  if (buffers.length !== 1) throw new Error(`${key}: ${buffers.length} buffers, script espera 1`);
  const images = json.images || [];
  const replaced = new Map(); // bufferView index -> new bytes
  let pending = images
    .filter((img) => img.bufferView != null)
    .map(async (img) => {
      const bv = json.bufferViews[img.bufferView];
      const oldBytes = bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
      const newBytes = await reencode(oldBytes);
      replaced.set(img.bufferView, newBytes);
    });
  await Promise.all(pending);

  if (replaced.size === 0) {
    console.log(`${key}: sin imágenes embebidas, no aplica`);
    continue;
  }

  // Nuevo BIN: copia los bufferViews no reemplazados y añade las nuevas imágenes.
  const parts = [];
  let offset = 0;
  const newOffset = (i) => {
    const bv = json.bufferViews[i];
    if (replaced.has(i)) {
      const data = replaced.get(i);
      bv.byteOffset = offset;
      bv.byteLength = data.length;
      parts.push(data);
      offset += data.length;
    } else {
      const old = bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength);
      bv.byteOffset = offset;
      bv.byteLength = old.length;
      parts.push(old);
      offset += old.length;
    }
  };
  for (let i = 0; i < json.bufferViews.length; i++) newOffset(i);
  const newBin = Buffer.concat(parts);
  const binPad = (4 - (newBin.length & 3)) & 3;
  binChunk.data = binPad ? Buffer.concat([newBin, Buffer.alloc(binPad)]) : newBin;

  for (const img of images) {
    if (img.bufferView != null && replaced.has(img.bufferView)) img.mimeType = "image/webp";
    if (img.uri) img.uri = undefined;
  }
  json.buffers[0].byteLength = newBin.length;

  // Re-alinear el JSON (los offsets del BIN cambian con el largo del JSON).
  const jsonBuf = Buffer.from(JSON.stringify(json));
  const jsonPad = (4 - (jsonBuf.length & 3)) & 3;
  jsonChunk.data = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);

  writeGlb(src, chunks);
  const after = statSync(src).size;
  const saved = ((before - after) / before) * 100;
  console.log(`${key}: ${(before / 1048576).toFixed(2)}MB -> ${(after / 1048576).toFixed(2)}MB  (-${saved.toFixed(0)}%, ${replaced.size} textura(s))`);
}
console.log("listo: texturas WebP aplicadas");