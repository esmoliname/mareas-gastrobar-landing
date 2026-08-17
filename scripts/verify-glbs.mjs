// Verifica los 20 GLBs: decodifica (incluye Draco) con gltf-transform + draco3dgltf,
// aplica transformadas de nodo y compara el bbox MUNDIAL con sizeM del catálogo.
// Detecta geometría colapsada (accessors con 1 vértice). Uso: node scripts/verify-glbs.mjs
import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { createDecoderModule } from "draco3dgltf";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, statSync } from "node:fs";
import * as THREE from "three";
import { modelCatalog } from "../src/data/models3d.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS = resolve(ROOT, "public", "models");

const decoder = await createDecoderModule({});
const io = new NodeIO();
io.registerExtensions([KHRDracoMeshCompression]);
io.registerDependencies({ "draco3d.decoder": decoder });

function primBBox(prim) {
  const pos = prim.getAttribute("POSITION");
  if (!pos) return null;
  const arr = pos.getArray();
  const n = pos.getCount();
  if (n < 3) return null;
  let mn = [Infinity, Infinity, Infinity];
  let mx = [-Infinity, -Infinity, -Infinity];
  const stride = pos.getElementSize();
  for (let i = 0; i < arr.length; i += stride) {
    for (let k = 0; k < 3; k++) {
      if (arr[i + k] < mn[k]) mn[k] = arr[i + k];
      if (arr[i + k] > mx[k]) mx[k] = arr[i + k];
    }
  }
  return { min: new THREE.Vector3(...mn), max: new THREE.Vector3(...mx), verts: n };
}

function worldBBox(doc) {
  const root = doc.getRoot();
  const box = new THREE.Box3();
  box.makeEmpty();
  let verts = 0;
  const visit = (node) => {
    const mesh = node.getMesh();
    if (mesh) {
      const world = new THREE.Matrix4().fromArray(node.getWorldMatrix());
      for (const prim of mesh.listPrimitives()) {
        const b = primBBox(prim);
        if (!b) continue;
        verts += b.verts;
        box.union(new THREE.Box3(b.min, b.max).applyMatrix4(world));
      }
    }
    for (const child of node.listChildren()) visit(child);
  };
  for (const n of root.listScenes()[0].listChildren()) visit(n);
  const s = box.isEmpty() ? null : box.getSize(new THREE.Vector3());
  return { max: s ? Math.max(s.x, s.y, s.z) : null, verts };
}

const keys = Object.keys(modelCatalog);
let fail = 0;
for (const key of keys) {
  const file = resolve(MODELS, `${key}.glb`);
  const doc = await io.read(file);
  const { max, verts } = worldBBox(doc);
  const target = modelCatalog[key].sizeM;
  const sizeMb = (statSync(file).size / 1048576).toFixed(2);
  const ok = max != null && Math.abs(max - target) < 0.005 && verts > 10;
  if (!ok) fail++;
  console.log(`${ok ? "OK " : "FAIL"} ${key}: world=${max?.toFixed(4)} target=${target} verts=${verts} (${sizeMb} MB)`);
}
console.log(fail === 0 ? "TODOS OK" : `${fail} FALLARON`);