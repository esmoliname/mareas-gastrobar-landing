// Inspecciona los GLBs del catálogo: bbox en metros (accesors + transformadas
// de nodos con THREE.Matrix4), vértices, materiales e imágenes embebidas.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { modelCatalog } from "../src/data/models3d.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODELS_DIR = path.join(ROOT, "public", "models");

function glbJson(pathname) {
  const buf = fs.readFileSync(pathname);
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546c67) throw new Error("not a GLB");
  const len = buf.readUInt32LE(12);
  if (buf.toString("ascii", 16, 20) !== "JSON") throw new Error("bad GLB chunk");
  return JSON.parse(buf.toString("utf8", 20, 20 + len));
}

function walkImages(json) {
  const out = [];
  const seen = new Set();
  for (const img of json.images || []) {
    const bv = img.bufferView != null ? json.bufferViews[img.bufferView] : null;
    const name = img.name || img.uri || "?";
    out.push({ name, mime: img.mimeType, bytes: bv?.byteLength ?? 0 });
    seen.add(name);
  }
  for (const tex of json.textures || []) {
    const src = tex.source != null ? json.images[tex.source] : null;
    if (!src) continue;
    const name = src.name || src.uri || "?";
    if (seen.has(name)) continue;
    const bv = src.bufferView != null ? json.bufferViews[src.bufferView] : null;
    out.push({ name, mime: src.mimeType, bytes: bv?.byteLength ?? 0 });
    seen.add(name);
  }
  return out;
}

function sceneBBox(json) {
  const nodes = json.nodes || [];
  const mats = new Map();
  const stack = (json.scenes?.[0]?.nodes || []).map((i) => [i, new THREE.Matrix4()]);
  while (stack.length) {
    const [i, parent] = stack.pop();
    const node = nodes[i];
    const local = node.matrix
      ? new THREE.Matrix4().fromArray(node.matrix)
      : new THREE.Matrix4().compose(
          new THREE.Vector3(...(node.translation || [0, 0, 0])),
          new THREE.Quaternion(...(node.rotation || [0, 0, 0, 1])),
          new THREE.Vector3(...(node.scale || [1, 1, 1]))
        );
    const world = parent.clone().multiply(local);
    mats.set(i, world);
    for (const child of node.children || []) stack.push([child, world]);
  }
  const box = new THREE.Box3();
  box.makeEmpty();
  const visit = (i) => {
    const node = nodes[i];
    if (node.mesh != null) {
      for (const prim of json.meshes[node.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        if (!acc?.min) continue;
        const aabb = new THREE.Box3(new THREE.Vector3(...acc.min), new THREE.Vector3(...acc.max));
        box.union(aabb.applyMatrix4(mats.get(i)));
      }
    }
    for (const child of node.children || []) visit(child);
  };
  for (const root of json.scenes?.[0]?.nodes || []) visit(root);
  if (box.isEmpty()) return null;
  const s = box.getSize(new THREE.Vector3());
  return [s.x, s.y, s.z];
}

for (const [key, entry] of Object.entries(modelCatalog)) {
  const glbPath = path.join(MODELS_DIR, path.basename(entry.glb));
  if (!fs.existsSync(glbPath)) {
    console.log(`${key}: MISSING ${entry.glb}`);
    continue;
  }
  const json = glbJson(glbPath);
  const imgs = walkImages(json);
  const prims = (json.meshes || []).reduce((n, m) => n + (m.primitives || []).length, 0);
  const exts = json.extensionsUsed || [];
  const size = sceneBBox(json);
  const sizeTxt = size
    ? `x=${size[0].toFixed(4)} y=${size[1].toFixed(4)} z=${size[2].toFixed(4)} max=${Math.max(...size).toFixed(4)}`
    : "no geometry";
  const realMax = size ? (Math.max(...size) * entry.scale).toFixed(4) : "-";
  const imgTxt = imgs.length
    ? `| imgs: ${imgs.map((i) => `${i.name}(${(i.bytes / 1048576).toFixed(2)}MB)`).join(", ")}`
    : "| imgs: none";
  const bytes = fs.statSync(glbPath).size;
  console.log(
    `${key}: file=${(bytes / 1048576).toFixed(2)}MB meshes=${(json.meshes || []).length} prims=${prims} ` +
    `scale=${entry.scale} bbox=${sizeTxt} realMax=${realMax}m ${imgTxt} ext=[${exts.join(",")}]`
  );
}