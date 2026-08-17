// Generador de modelos 3D procedurales para Mareas Gastrobar.
// Crea un .glb por platillo en public/models/ autorado en METROS (1 unidad = 1 m,
// base en y=0, centrado en XZ) para que ar-scale="fixed" muestre tamaño real.
// Uso: node scripts/gen-models.js  →  regenera los 10 platillos "casa".
// Requiere three como devDependency (npm i -D three).

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// Polyfill mínimo de FileReader para que GLTFExporter pueda escribir binarios en Node.
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend();
      });
    }
  };
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public", "models");

const mat = (color, { roughness = 0.55, metalness = 0, transparent = false, opacity = 1, flat = false } = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent, opacity, flatShading: flat });

const g = (children = []) => {
  const group = new THREE.Group();
  children.forEach((c) => group.add(c));
  return group;
};

const mesh = (geo, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) => {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...position);
  m.rotation.set(...rotation);
  m.scale.set(...scale);
  return m;
};

const cyl = (rt, rb, h, seg = 32) => new THREE.CylinderGeometry(rt, rb, h, seg);
const sph = (r, seg = 24) => new THREE.SphereGeometry(r, seg, seg / 2);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cone = (r, h, seg = 24) => new THREE.ConeGeometry(r, h, seg);
const torus = (r, tube, arc = Math.PI * 2) => new THREE.TorusGeometry(r, tube, 14, 28, arc);
const disk = (r, seg = 24) => new THREE.CircleGeometry(r, seg);

const lathe = (points) =>
  new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    32
  );

// Plato cerámico genérico (diámetro en metros).
const plate = (d = 0.22) => {
  const r = d / 2;
  return g([
    mesh(cyl(r, r, 0.012, 40), mat(0xe8e0d0, { roughness: 0.35 }), [0, 0.006, 0]),
    mesh(cyl(r * 0.68, r * 0.68, 0.006, 40), mat(0xd9d2c2, { roughness: 0.4 }), [0, 0.014, 0]),
  ]);
};

// Vaso highball transparente (mojito).
const highball = (h = 0.16, rBase = 0.028, rTop = 0.034) =>
  mesh(
    lathe([
      [rBase * 0.6, 0],
      [rBase, 0.001],
      [rBase, h * 0.9],
      [rTop, h],
    ]),
    mat(0xbfd8d0, { roughness: 0.08, metalness: 0.02, transparent: true, opacity: 0.28 }),
    [0, 0, 0]
  );

// Copa coupe (margarita): pie + tallo + cuenco.
const coupe = (bowlR = 0.052, h = 0.13) =>
  g([
    mesh(cyl(bowlR * 0.75, bowlR * 0.55, 0.065, 40), mat(0xbfd8d0, { roughness: 0.08, transparent: true, opacity: 0.3 }), [0, 0.045, 0]),
    mesh(cyl(0.0055, 0.0055, 0.055, 20), mat(0xbfd8d0, { roughness: 0.08, transparent: true, opacity: 0.3 }), [0, 0.028, 0]),
    mesh(cyl(0.032, 0.006, 0.006, 32), mat(0xbfd8d0, { roughness: 0.08, transparent: true, opacity: 0.3 }), [0, 0.003, 0]),
  ]);

const straw = (h = 0.14, x = 0, z = 0, rot = 0.18) =>
  mesh(cyl(0.003, 0.003, h, 12), mat(0xe06f3a, { roughness: 0.3 }), [x, h / 2, z], [0, 0, rot]);

const iceCube = (x, y, z, s = 0.016) =>
  mesh(box(s, s, s), mat(0xe8f4f0, { roughness: 0.15, transparent: true, opacity: 0.75 }), [x, y, z]);

const limeWheel = (r = 0.018, x = 0, y = 0, z = 0, rotZ = 0) =>
  g([
    mesh(torus(r, 0.0045, Math.PI * 2), mat(0x3f9d3f, { roughness: 0.5 }), [x, y, z], [Math.PI / 2, 0, rotZ]),
    mesh(disk(r * 0.82).rotateX(Math.PI / 2), mat(0xd8e8a0, { roughness: 0.5 }), [x, y, z], [0, 0, rotZ]),
  ]);

const RECIPES = {
  // Mojito de Fresa: vaso alto, líquido verde, hielo, menta, lima, pajilla.
  mojito: () => {
    const H = 0.16;
    return g([
      highball(H),
      mesh(cyl(0.03, 0.029, 0.05, 32), mat(0x7fbf5a, { roughness: 0.1, transparent: true, opacity: 0.9 }), [0, 0.042, 0]),
      iceCube(-0.012, 0.075, 0.006),
      iceCube(0.01, 0.078, -0.008),
      iceCube(0.004, 0.07, 0.012),
      mesh(sph(0.009), mat(0x3f9d3f, { roughness: 0.6 }), [-0.012, 0.098, -0.01], [0.2, 0, 0.4], [1, 0.35, 1]),
      mesh(sph(0.009), mat(0x3f9d3f, { roughness: 0.6 }), [0.012, 0.096, 0.008], [-0.2, 0, -0.3], [1, 0.35, 1]),
      mesh(sph(0.007), mat(0x3f9d3f, { roughness: 0.6 }), [0.004, 0.1, -0.014], [0.1, 0, 0.2], [1, 0.35, 1]),
      mesh(cyl(0.002, 0.002, 0.03, 10), mat(0x2f7d2f, { roughness: 0.5 }), [-0.012, 0.106, -0.01], [0.15, 0, 0.3]),
      limeWheel(0.017, 0.028, 0.148, 0.008, 0.5),
      straw(0.15, -0.006, 0.016, 0.16),
      mesh(sph(0.009), mat(0xd94f4f, { roughness: 0.35 }), [0.004, 0.108, 0.018]),
    ]);
  },

  // Margarita Maracuyá: copa coupe, líquido amarillo, borde salado, lima.
  margarita: () => {
    const BOWL = 0.052;
    return g([
      coupe(BOWL, 0.13),
      mesh(sph(BOWL * 0.74, 32), mat(0xe8c85a, { roughness: 0.12, transparent: true, opacity: 0.95 }), [0, 0.09, 0], [0, 0, 0], [1, 0.62, 1]),
      mesh(torus(BOWL * 0.98, 0.006), mat(0xf2efe8, { roughness: 0.4 }), [0, 0.132, 0], [Math.PI / 2, 0, 0]),
      limeWheel(0.02, BOWL * 0.92, 0.128, 0, 0.6),
      mesh(cyl(0.0025, 0.0025, 0.09, 10), mat(0xe06f3a, { roughness: 0.3 }), [0.02, 0.16, 0.012], [0, 0, -0.12]),
    ]);
  },

  // Piña Colada Mareas: vaso rocas, líquido cremoso, piña, cereza, pajilla.
  pina: () => {
    const H = 0.1;
    return g([
      mesh(cyl(0.035, 0.028, H, 36), mat(0xbfd8d0, { roughness: 0.08, transparent: true, opacity: 0.3 }), [0, H / 2, 0]),
      mesh(cyl(0.033, 0.027, 0.052, 36), mat(0xf4efe0, { roughness: 0.1, transparent: true, opacity: 0.96 }), [0, 0.04, 0]),
      mesh(cyl(0.014, 0.026, 0.012, 24), mat(0x2f9d4f, { roughness: 0.5 }), [0.028, 0.016, 0.004]),
      mesh(cone(0.02, 0.05, 24), mat(0xe8b64a, { roughness: 0.45 }), [0.034, 0.07, 0.004], [0, 0, Math.PI / 2]),
      mesh(cone(0.006, 0.02, 10), mat(0x2f9d4f, { roughness: 0.5 }), [0.032, 0.098, -0.002], [0, 0, Math.PI / 2]),
      mesh(cone(0.006, 0.022, 10), mat(0x2f9d4f, { roughness: 0.5 }), [0.046, 0.09, 0.008], [0, 0, Math.PI / 2]),
      mesh(cone(0.006, 0.018, 10), mat(0x2f9d4f, { roughness: 0.5 }), [0.028, 0.088, 0.014], [0, 0, Math.PI / 2]),
      mesh(sph(0.007, 16), mat(0xd94f4f, { roughness: 0.3 }), [0.005, 0.095, 0.016]),
      straw(0.13, -0.008, 0.018, 0.2),
    ]);
  },

  // Alitas BBQ Miel: plato, 6 alitas glaseadas, dip ranch.
  alitas: () => {
    const drumstick = (x, z, tilt, rot) => {
      const stick = g([
        mesh(cyl(0.011, 0.008, 0.042, 18), mat(0xb5651d, { roughness: 0.5 }), [0, 0.021, 0]),
        mesh(sph(0.0145, 18), mat(0xb5651d, { roughness: 0.5 }), [0, 0.052, 0]),
        mesh(sph(0.012, 16), mat(0x8a3b10, { roughness: 0.25, metalness: 0.05 }), [0.006, 0.055, 0.004]),
      ]);
      stick.position.set(x, 0, z);
      stick.rotation.y = rot;
      stick.rotation.x = tilt;
      return stick;
    };
    const n = 6;
    const parts = [plate(0.24)];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      parts.push(drumstick(Math.sin(a) * 0.062, Math.cos(a) * 0.062, 0.62, -a + Math.PI / 2));
    }
    parts.push(mesh(cyl(0.019, 0.015, 0.032, 24), mat(0xf2efe8, { roughness: 0.4 }), [0, 0.016, 0.05]));
    return g(parts);
  },

  // Nachos del Faro: plato, totopos, queso, guacamole, pico de gallo.
  nachos: () => {
    const chip = (x, z, ry) =>
      mesh(cone(0.017, 0.008, 5), mat(0xe8b64a, { roughness: 0.6 }), [x, 0.016, z], [0.1, ry, 0.15], [1, 0.5, 1]);
    const parts = [plate(0.28)];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 0.04 + ((i * 37) % 5) * 0.011;
      parts.push(chip(Math.sin(a) * r, Math.cos(a) * r, (i * 47) % 360));
    }
    parts.push(
      mesh(sph(0.026, 20), mat(0xf0a030, { roughness: 0.35, transparent: true, opacity: 0.88 }), [0, 0.03, 0], [0, 0, 0], [1, 0.42, 1]),
      mesh(sph(0.022, 20), mat(0x9ac85a, { roughness: 0.6 }), [-0.014, 0.035, 0.008], [0, 0, 0], [1, 0.5, 1]),
      mesh(sph(0.018, 20), mat(0xf0a030, { roughness: 0.35, transparent: true, opacity: 0.88 }), [0.02, 0.033, -0.012], [0, 0, 0], [1, 0.4, 1])
    );
    const pico = (x, z, c) => mesh(box(0.008, 0.008, 0.008), mat(c, { roughness: 0.6 }), [x, 0.045, z], [0.3, 0.2, 0.1]);
    parts.push(
      pico(0.006, -0.008, 0xd94f4f),
      pico(-0.004, 0.014, 0x3f9d3f),
      pico(0.014, 0.006, 0xf2efe8),
      pico(-0.018, -0.006, 0xf2efe8)
    );
    return g(parts);
  },

  // Papas Locas: canasta, papas fritas, queso, jalapeños.
  papas: () => {
    const fry = (x, z, ry) =>
      mesh(box(0.008, 0.042, 0.008), mat(0xe8b64a, { roughness: 0.6 }), [x, 0.038, z], [0.1, ry, 0.06]);
    const parts = [
      mesh(cyl(0.075, 0.058, 0.05, 32), mat(0x7a5a3a, { roughness: 0.7 }), [0, 0.025, 0]),
      mesh(torus(0.075, 0.006), mat(0x8a6a44, { roughness: 0.6 }), [0, 0.05, 0], [Math.PI / 2, 0, 0]),
    ];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(fry(Math.sin(a) * 0.032, Math.cos(a) * 0.032, (i * 53) % 360));
    }
    parts.push(
      mesh(sph(0.03, 20), mat(0xf0a030, { roughness: 0.35, transparent: true, opacity: 0.85 }), [0, 0.09, 0], [0, 0, 0], [1, 0.35, 1]),
      mesh(torus(0.011, 0.004, Math.PI * 2), mat(0x3f9d3f, { roughness: 0.5 }), [0.012, 0.092, 0.006], [0, 0, 0.4]),
      mesh(torus(0.011, 0.004, Math.PI * 2), mat(0x3f9d3f, { roughness: 0.5 }), [-0.01, 0.09, -0.01], [0.3, 0, -0.3])
    );
    return g(parts);
  },

  // Camarones al Ajillo: plato, camarones curvos, mantequilla de ajo, limón, perejil.
  camarones: () => {
    const shrimp = (x, z, rot) => {
      const s = g([
        mesh(torus(0.026, 0.011, Math.PI * 0.72), mat(0xe8837a, { roughness: 0.45 }), [0, 0.016, 0], [0, 0, 0.35]),
        mesh(sph(0.011, 16), mat(0xe8837a, { roughness: 0.45 }), [0.002, 0.03, 0]),
        mesh(cone(0.009, 0.016, 14), mat(0xf0a090, { roughness: 0.5 }), [-0.014, 0.02, 0], [0, 0, -1.1]),
      ]);
      s.position.set(x, 0, z);
      s.rotation.y = rot;
      return s;
    };
    const parts = [plate(0.24)];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.6;
      parts.push(shrimp(Math.sin(a) * 0.058, Math.cos(a) * 0.058, -a));
    }
    parts.push(
      mesh(sph(0.028, 20), mat(0xf2e8c0, { roughness: 0.5, transparent: true, opacity: 0.9 }), [0, 0.03, 0], [0, 0, 0], [1, 0.35, 1]),
      mesh(cone(0.016, 0.028, 20), mat(0xe8d020, { roughness: 0.5 }), [0.085, 0.014, 0.03], [0, 0, Math.PI / 2]),
      mesh(disk(0.013, 16).rotateX(Math.PI / 2), mat(0xf2efe8, { roughness: 0.5 }), [0.085, 0.02, 0.03], [0, 0, Math.PI / 2]),
      mesh(sph(0.005, 10), mat(0x3f9d3f, { roughness: 0.5 }), [0.01, 0.036, 0.02]),
      mesh(sph(0.005, 10), mat(0x3f9d3f, { roughness: 0.5 }), [-0.012, 0.035, -0.015])
    );
    return g(parts);
  },

  // Ceviche Mareas: tazón, corvina, cebolla, culantro, limón, tostadas.
  ceviche: () => {
    const parts = [
      mesh(sph(0.09, 28, 14), mat(0xd8cfb8, { roughness: 0.5 }), [0, 0.02, 0], [0, 0, 0], [1, 0.45, 1]),
      mesh(torus(0.09, 0.008), mat(0xbfb49a, { roughness: 0.4 }), [0, 0.082, 0], [Math.PI / 2, 0, 0]),
    ];
    const cube = (x, z, c = 0xf2efe8) => mesh(box(0.02, 0.02, 0.02), mat(c, { roughness: 0.6 }), [x, 0.052, z], [0.2, 0.4, 0.1]);
    parts.push(
      cube(-0.02, 0.01, 0xf2efe8),
      cube(0.012, 0.02, 0xf7f3ec),
      cube(0.02, -0.015, 0xf2efe8),
      cube(-0.008, -0.024, 0xf7f3ec),
      cube(0.0, 0.0, 0xefd8c8),
      mesh(torus(0.012, 0.003), mat(0xd8b4c8, { roughness: 0.5 }), [-0.008, 0.062, 0.03], [Math.PI / 2, 0, 0.3]),
      mesh(torus(0.009, 0.003), mat(0xc8a4b8, { roughness: 0.5 }), [0.03, 0.06, 0.012], [Math.PI / 2, 0, -0.4]),
      mesh(sph(0.005, 8), mat(0x3f9d3f, { roughness: 0.5 }), [0.01, 0.066, -0.018]),
      mesh(sph(0.005, 8), mat(0x3f9d3f, { roughness: 0.5 }), [-0.024, 0.064, 0.002]),
      limeWheel(0.016, 0.052, 0.088, 0.03, 0.7),
      mesh(cyl(0.036, 0.034, 0.009, 28), mat(0xc89a5a, { roughness: 0.7 }), [-0.085, 0.012, -0.045], [0.5, 0, 0]),
      mesh(cyl(0.036, 0.034, 0.009, 28), mat(0xc89a5a, { roughness: 0.7 }), [0.075, 0.02, -0.06], [0.35, 0, 0])
    );
    return g(parts);
  },

  // Picnic Sunset: bandeja con sandía, piña, naranja, kiwi, uvas y fresa.
  frutas: () => {
    const parts = [
      mesh(cyl(0.14, 0.135, 0.01, 40), mat(0x8a6a44, { roughness: 0.6 }), [0, 0.005, 0]),
      mesh(torus(0.14, 0.005), mat(0x9a7a54, { roughness: 0.5 }), [0, 0.014, 0], [Math.PI / 2, 0, 0]),
      mesh(sph(0.045, 22), mat(0xd94f4f, { roughness: 0.4 }), [-0.07, 0.028, -0.03], [0, 0, 0], [0.65, 0.4, 1]),
      mesh(torus(0.045, 0.008), mat(0x2f9d4f, { roughness: 0.5 }), [-0.07, 0.028, -0.03], [0, 0, 0], [0.65, 0.4, 1]),
      mesh(cone(0.024, 0.055, 20), mat(0xe8b64a, { roughness: 0.45 }), [0.05, 0.033, -0.05], [0, 0, Math.PI / 2]),
      mesh(cone(0.007, 0.022, 10), mat(0x2f9d4f, { roughness: 0.5 }), [0.052, 0.066, -0.052], [0, 0, Math.PI / 2]),
      mesh(cone(0.007, 0.024, 10), mat(0x2f9d4f, { roughness: 0.5 }), [0.064, 0.06, -0.04], [0, 0, Math.PI / 2]),
      limeWheel(0.024, 0.07, 0.022, 0.045, 0.8),
      mesh(cyl(0.02, 0.02, 0.009, 24), mat(0x9ac85a, { roughness: 0.4 }), [-0.02, 0.018, 0.06], [0, 0, 0.3]),
      mesh(disk(0.005, 10).rotateX(Math.PI / 2), mat(0xf2efe8, { roughness: 0.4 }), [-0.02, 0.021, 0.06]),
    ];
    const grape = (x, z) => mesh(sph(0.007, 12), mat(0x7a4fa0, { roughness: 0.35 }), [x, 0.025, z]);
    parts.push(
      grape(0.02, -0.08), grape(0.032, -0.074), grape(0.014, -0.068),
      grape(0.026, -0.062), grape(0.038, -0.084), grape(0.02, -0.092)
    );
    parts.push(mesh(cone(0.014, 0.03, 18), mat(0xd94f4f, { roughness: 0.4 }), [-0.045, 0.024, 0.07], [0.2, 0, 0]));
    return g(parts);
  },

  // Cumpleaños Mareas: torta dos pisos, frosting, fresa y vela.
  torta: () => {
    return g([
      plate(0.2),
      mesh(cyl(0.068, 0.068, 0.055, 36), mat(0xc98a4b, { roughness: 0.5 }), [0, 0.033, 0]),
      mesh(cyl(0.048, 0.048, 0.05, 32), mat(0xe8c8a0, { roughness: 0.5 }), [0, 0.086, 0]),
      mesh(cyl(0.07, 0.07, 0.012, 36), mat(0xf2efe8, { roughness: 0.4 }), [0, 0.064, 0]),
      mesh(cyl(0.05, 0.05, 0.01, 32), mat(0xf2efe8, { roughness: 0.4 }), [0, 0.115, 0]),
      mesh(cone(0.012, 0.026, 16), mat(0xd94f4f, { roughness: 0.4 }), [0.028, 0.132, 0.01], [0.2, 0, 0]),
      mesh(cyl(0.004, 0.004, 0.05, 12), mat(0xf2efe8, { roughness: 0.3 }), [-0.02, 0.152, 0]),
      mesh(cone(0.007, 0.016, 14), mat(0xf09030, { roughness: 0.4 }), [-0.02, 0.182, 0]),
      mesh(sph(0.0045, 10), mat(0xffd060, { roughness: 0.3 }), [-0.02, 0.187, 0])
    ]);
  },
};

mkdirSync(OUT, { recursive: true });

const exporter = new GLTFExporter();
const entries = Object.entries(RECIPES);

for (const [key, build] of entries) {
  const scene = build();
  const glb = await exporter.parseAsync(scene, { binary: true });
  writeFileSync(resolve(OUT, `${key}.glb`), Buffer.from(glb));
  const size = (glb.byteLength / 1024).toFixed(1);
  console.log(`OK  ${key}.glb  (${size} KB)`);
}

console.log(`\n${entries.length} modelos generados en public/models/`);