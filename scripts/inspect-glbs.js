// Inspecciona los GLBs del catálogo: bbox real (con el factor del catálogo),
// vértices, materiales e imágenes embebidas. Útil para decidir compresión.
const fs = require("fs");
const path = require("path");
const { WebGLRenderingContext } = require("./helpers/polyfills.js");
const THREE = require("three");
const { GLTFLoader } = require("three/examples/jsm/loaders/GLTFLoader.js");

const MODELS_DIR = path.join(__dirname, "..", "public", "models");
const catalog = require("../src/data/models3d.cjs.json");

global.self = global;
global.window = global;
global.WebGLRenderingContext = WebGLRenderingContext;
global.self.FileReader = class {
  readAsArrayBuffer(blob) {
    const f = new FileReader();
    const reader = this;
    blob.arrayBuffer().then((buf) => {
      reader.result = buf;
      reader.onloadend?.();
    });
  }
};
global.FileReader = global.self.FileReader;

const loader = new GLTFLoader();

function glbJson(pathname) {
  const buf = fs.readFileSync(pathname);
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546c67) throw new Error("not a GLB");
  const len = buf.readUInt32LE(12);
  const type = buf.toString("ascii", 16, 20);
  if (type !== "JSON") throw new Error("bad GLB chunk");
  return JSON.parse(buf.toString("utf8", 20, 20 + len));
}

function walkImages(json) {
  const out = [];
  for (const img of json.images || []) {
    const bv = img.bufferView != null ? json.bufferViews[img.bufferView] : null;
    out.push({ name: img.name || img.uri || "?", mime: img.mimeType, bytes: bv?.byteLength ?? 0 });
  }
  for (const tex of json.textures || []) {
    const src = tex.source != null ? json.images[tex.source] : null;
    if (src && !out.find((i) => i.name === src.name)) {
      const bv = src.bufferView != null ? json.bufferViews[src.bufferView] : null;
      out.push({ name: src.name, mime: src.mimeType, bytes: bv?.byteLength ?? 0 });
    }
  }
  return out;
}

async function main() {
  const names = process.argv.slice(2);
  const keys = names.length ? names : Object.keys(catalog);
  for (const key of keys) {
    const entry = catalog[key];
    const glbPath = path.join(MODELS_DIR, path.basename(entry.glb));
    if (!fs.existsSync(glbPath)) {
      console.log(`${key}: MISSING ${entry.glb}`);
      continue;
    }
    const json = glbJson(glbPath);
    const imgs = walkImages(json);
    const prims = (json.meshes || []).reduce((n, m) => n + (m.primitives || []).length, 0);
    const exts = Object.keys(json.extensionsUsed || {});

    let size = null;
    try {
      const gltf = await loader.loadAsync(glbPath);
      const box = new THREE.Box3().setFromObject(gltf.scene);
      size = box.getSize(new THREE.Vector3());
    } catch (e) {
      size = `ERROR ${e.message.slice(0, 60)}`;
    }

    const sizeTxt = typeof size === "string"
      ? size
      : `x=${size.x.toFixed(4)} y=${size.y.toFixed(4)} z=${size.z.toFixed(4)} max=${Math.max(size.x, size.y, size.z).toFixed(4)}`;
    const real = typeof size === "object"
      ? (Math.max(size.x, size.y, size.z) * entry.scale).toFixed(4)
      : "-";
    const imgTxt = imgs.length
      ? `| imgs: ${imgs.map((i) => `${i.name}(${(i.bytes / 1048576).toFixed(2)}MB)`).join(", ")}`
      : "| imgs: none";
    const bytes = fs.statSync(glbPath).size;
    console.log(
      `${key}: file=${(bytes / 1048576).toFixed(2)}MB meshes=${(json.meshes || []).length} prims=${prims} ` +
      `scale=${entry.scale} size=${sizeTxt} realMax=${real}m ${imgTxt} ext=[${exts.join(",")}]`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});