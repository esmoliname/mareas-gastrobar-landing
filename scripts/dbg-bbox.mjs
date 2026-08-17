import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const buf = readFileSync(resolve(ROOT, "public/models/lantern.glb"));
const len = buf.readUInt32LE(12);
const json = JSON.parse(buf.toString("utf8", 20, 20 + len));

const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const compose = (t, r, s) => {
  const tx = t?.[0] ?? 0, ty = t?.[1] ?? 0, tz = t?.[2] ?? 0;
  const sx = s?.[0] ?? 1, sy = s?.[1] ?? 1, sz = s?.[2] ?? 1;
  let qx = r?.[0] ?? 0, qy = r?.[1] ?? 0, qz = r?.[2] ?? 0, qw = r?.[3] ?? 1;
  const n = Math.hypot(qx, qy, qz, qw) || 1;
  qx /= n; qy /= n; qz /= n; qw /= n;
  const [x2, y2, z2] = [qx + qx, qy + qy, qz + qz];
  const [xx, xy, xz] = [qx * x2, qx * y2, qx * z2];
  const [yy, yz, zz] = [qy * y2, qy * z2, qz * z2];
  const [wx, wy, wz] = [qw * x2, qw * y2, qw * z2];
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
};
const multiply = (a, b) => {
  const o = new Array(16);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
  return o;
};

const mats = new Map();
const stack = (json.scenes?.[0]?.nodes || []).map((i) => [i, identity()]);
while (stack.length) {
  const [i, parent] = stack.pop();
  const node = json.nodes[i];
  const local = node.matrix ? [...node.matrix] : compose(node.translation, node.rotation, node.scale);
  const world = multiply(parent, local);
  mats.set(i, world);
  for (const child of node.children || []) stack.push([child, world]);
}

console.log("mats:", [...mats.keys()].map((k) => [k, mats.get(k)[0], mats.get(k)[5], mats.get(k)[12]]));

let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];
for (const [i, node] of json.nodes.entries()) {
  if (node.mesh == null) continue;
  const m = mats.get(i);
  for (const prim of json.meshes[node.mesh].primitives) {
    const acc = json.accessors[prim.attributes.POSITION];
    if (!acc?.min) continue;
    for (const corner of [
      [acc.min[0], acc.min[1], acc.min[2]], [acc.max[0], acc.min[1], acc.min[2]],
      [acc.min[0], acc.max[1], acc.min[2]], [acc.max[0], acc.max[1], acc.min[2]],
      [acc.min[0], acc.min[1], acc.max[2]], [acc.max[0], acc.min[1], acc.max[2]],
      [acc.min[0], acc.max[1], acc.max[2]], [acc.max[0], acc.max[1], acc.max[2]],
    ]) {
      const p = transformPoint(m, corner);
      for (let k = 0; k < 3; k++) {
        if (p[k] < min[k]) min[k] = p[k];
        if (p[k] > max[k]) max[k] = p[k];
      }
    }
  }
}

function transformPoint(m, p) {
  return [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
  ];
}

console.log("bbox:", max.map((v, k) => v - min[k]), "max dim:", Math.max(...max.map((v, k) => v - min[k])));