// Decodifica un GLB (soporta KHR_draco_mesh_compression) con three.js en Node
// y devuelve el bbox real de la geometría. Quita texturas del JSON para evitar
// dependencias de fetch/blob en Node. Uso: node scripts/check-bbox.mjs <archivo.glb>
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

globalThis.self = globalThis;
globalThis.window = globalThis;
globalThis.ProgressEvent = class ProgressEvent extends Event {
  constructor(type, props = {}) {
    super(type);
    this.lengthComputable = !!props.lengthComputable;
    this.loaded = props.loaded ?? 0;
    this.total = props.total ?? 0;
  }
};
const origFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input?.url;
  if (typeof url === "string" && !/^https?:/i.test(url)) {
    const p = url.startsWith("file:") ? new URL(url) : resolve(ROOT, url);
    return new Response(readFileSync(p), { status: 200 });
  }
  return origFetch(input, init);
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = resolve(ROOT, process.argv[2]);

function readGlb(path) {
  const buf = readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));
  const binStart = 20 + jsonLen + (4 - (jsonLen % 4)) % 4;
  const bin = buf.subarray(binStart, buf.length);
  return { json, bin };
}

function stripTextures(json) {
  let changed = false;
  if (json.images || json.textures || json.samplers) {
    delete json.images;
    delete json.textures;
    delete json.samplers;
    if (Array.isArray(json.materials)) {
      for (const m of json.materials) {
        stripTexKeys(m);
        if (m.extensions) {
          for (const [k, v] of Object.entries(m.extensions)) {
            if (typeof v === "object" && v) stripTexKeys(v);
            else delete m.extensions[k];
          }
        }
      }
    }
    json.extensionsUsed = (json.extensionsUsed || []).filter(
      (e) => !/KHR_texture|EXT_texture/i.test(e)
    );
    json.extensionsRequired = (json.extensionsRequired || []).filter(
      (e) => !/KHR_texture|EXT_texture/i.test(e)
    );
    changed = true;
  }
  return changed;
}

function stripTexKeys(obj) {
  for (const k of Object.keys(obj)) {
    if (/Texture$/i.test(k) || /^texture/i.test(k)) delete obj[k];
  }
}

function repackGlb(json, bin) {
  const jsonChunk = Buffer.from(JSON.stringify(json), "utf8");
  const pad = (4 - (jsonChunk.length % 4)) % 4;
  const padded = Buffer.concat([jsonChunk, Buffer.alloc(pad, 0x20)]);
  const total = 12 + 8 + padded.length + 8 + bin.length;
  const out = Buffer.alloc(total);
  out.write("glTF", 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  out.writeUInt32LE(padded.length, 12);
  out.writeUInt32LE(0x4e4f534a, 16);
  padded.copy(out, 20);
  out.writeUInt32LE(bin.length, 20 + padded.length);
  out.writeUInt32LE(0x004e4942, 24 + padded.length);
  bin.copy(out, 28 + padded.length);
  return out;
}

const { json, bin } = readGlb(file);
stripTextures(json);
const stripped = repackGlb(json, bin);
const tmpFile = file + ".check.glb";
writeFileSync(tmpFile, stripped);

const draco = new DRACOLoader();
draco.setDecoderPath(new URL("../node_modules/three/examples/jsm/libs/draco/", import.meta.url).href);
draco.setDecoderConfig({ type: "js" });
const loader = new GLTFLoader();
loader.setDRACOLoader(draco);

const gltf = await new Promise((res, rej) => {
  const buf = readFileSync(tmpFile);
  loader.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    "",
    res,
    rej
  );
});
const box = new THREE.Box3().setFromObject(gltf.scene);
const s = box.getSize(new THREE.Vector3());
let verts = 0;
gltf.scene.traverse((o) => {
  if (o.isMesh) verts += o.geometry.attributes.position.count;
});
console.log(
  `bbox: x=${s.x.toFixed(4)} y=${s.y.toFixed(4)} z=${s.z.toFixed(4)}  max=${Math.max(s.x, s.y, s.z).toFixed(4)} m  verts=${verts}`
);