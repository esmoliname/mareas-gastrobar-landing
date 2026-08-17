// Hornea un factor de escala uniforme dentro de un GLB reescribiendo solo el
// chunk JSON: multiplica la transformada de los nodos raiz de la escena por la
// escala. Preserva texturas, extensiones y binario byte a byte. Idempotente:
// el factor se calcula siempre sobre el bbox real actual del archivo.
// Uso: node scripts/bake-scale.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
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

function worldMatrices(json) {
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
  return mats;
}

function sceneBBox(json) {
  const nodes = json.nodes || [];
  const mats = worldMatrices(json);
  const box = new THREE.Box3();
  box.makeEmpty();
  const visit = (i) => {
    const node = nodes[i];
    if (node.mesh != null) {
      for (const prim of json.meshes[node.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        if (!acc?.min) continue;
        const aabb = new THREE.Box3(
          new THREE.Vector3(...acc.min),
          new THREE.Vector3(...acc.max)
        );
        box.union(aabb.applyMatrix4(mats.get(i)));
      }
    }
    for (const child of node.children || []) visit(child);
  };
  for (const root of json.scenes?.[0]?.nodes || []) visit(root);
  if (box.isEmpty()) return null;
  const s = box.getSize(new THREE.Vector3());
  return Math.max(s.x, s.y, s.z);
}

function scaleRoots(json, factor) {
  const s = factor;
  for (const i of json.scenes?.[0]?.nodes || []) {
    const node = json.nodes[i];
    if (node.matrix) {
      node.matrix = new THREE.Matrix4()
        .makeScale(s, s, s)
        .multiply(new THREE.Matrix4().fromArray(node.matrix))
        .toArray();
    } else {
      node.translation = (node.translation || [0, 0, 0]).map((v) => v * s);
      node.scale = (node.scale || [1, 1, 1]).map((v) => v * s);
    }
  }
}

function repack(json, chunks) {
  const jsonBuf = Buffer.from(JSON.stringify(json));
  const jsonPad = (4 - (jsonBuf.length & 3)) & 3;
  const padded = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);
  const jsonChunk = chunks.find((c) => c.type === 0x4e4f534a);
  const binChunk = chunks.find((c) => c.type === 0x004e4942);
  const delta = padded.length - jsonChunk.data.length;
  jsonChunk.data = padded;
  if (binChunk && delta !== 0) {
    for (const bv of json.bufferViews || []) {
      if (bv.buffer === 0) bv.byteOffset = (bv.byteOffset ?? 0) + delta;
    }
  }
  if (binChunk) {
    const binPad = (4 - (binChunk.data.length & 3)) & 3;
    if (binPad) binChunk.data = Buffer.concat([binChunk.data, Buffer.alloc(binPad)]);
  }
  return chunks;
}

for (const key of EXTERNAL) {
  const src = resolve(MODELS, `${key}.glb`);
  const chunks = readGlb(src);
  const json = JSON.parse(chunks.find((c) => c.type === 0x4e4f534a).data.toString("utf8"));
  const current = sceneBBox(json);
  const target = modelCatalog[key].sizeM;
  const factor = target / current;
  scaleRoots(json, factor);
  const after = sceneBBox(json);
  writeGlb(src, repack(json, chunks));
  const ok = Math.abs(after - target) < 0.0015 ? "OK " : "WARN";
  console.log(`${ok} ${key}: ${current.toFixed(4)} -> x${factor.toFixed(6)} -> ${after.toFixed(4)} m (target ${target})`);
}
console.log("listo: escalas horneadas en los GLB externos (scale=1 en el catalogo)");