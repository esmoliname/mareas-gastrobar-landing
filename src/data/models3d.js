// Catálogo de assets 3D gastronómicos, self-hosted en /public/models/.
// Cada entrada expone:
//   - glb    : ruta local del binario glTF (.glb) para WebXR / Scene Viewer / visor 3D
//   - usdz   : ruta local del binario USDZ para Apple Quick Look (iOS)
//   - sizeM  : tamaño físico real verificado en metros (bbox máximo del modelo)
//   - scale  : 1 para todos los modelos: la escala real está horneada en el GLB
//              (scripts/bake-scale.mjs) y los USDZ declaran metersPerUnit para
//              que WebXR y Quick Look muestren exactamente sizeM
//   - cameraOrbit: ángulo inicial óptimo para resaltar el volumen del platillo
//   - category: categoría del menú a la que pertenece (para agrupar en el admin
//              y sugerir modelos alternativos en el visor)
//
// Los modelos "casa" (mojito, margarita, pina, alitas, nachos, papas, camarones,
// ceviche, frutas, torta) se generan con scripts/gen-models.js (GLB, three.js) y
// scripts/gen-usdz.py (USDZ, OpenUSD) autorados en METROS. Regenerar:
//   node scripts/gen-models.js && python scripts/gen-usdz.py
// La verificación de tamaños reales de los 20 pares corre con:
//   node scripts/inspect-glbs.mjs  (bbox real de cada GLB)
//   python scripts/check-usdz.py   (bbox real de cada USDZ)
// Los externos se normalizan con: node scripts/bake-scale.mjs (GLB)
//                                 python scripts/fix-usdz-scale.py (USDZ)
//
// Origen del resto de assets (versionados en el repo para eliminar dependencias
// de CDNs externos y fallos de CORS en iOS):
//   - burger / dessert / steak: github.com/Yasirpyro/demo (glb + usdz emparejados)
//   - pizza / antojos:          github.com/Sauravdas1998/ar-food-models (glb)
//   - seafood / cocktail / beer / fruit / lantern: Khronos glTF-Sample-Assets (glb)
//   - usdz de Pizza, copas, pez, carne, cerveza, fruta y linterna:
//                               Google "Beautiful Things" / storage.googleapis.com
//   - grill: modelviewer.dev shared-assets (shishkebab.glb)

export const modelCatalog = {
  pizza: {
    label: "Pizza Artesanal",
    category: "Pizzas",
    glb: "/models/pizza.glb",
    usdz: "/models/pizza.usdz",
    sizeM: 0.35,
    scale: 1,
    cameraOrbit: "0deg 72deg 120%",
  },
  cocktail: {
    label: "Cóctel Tropical",
    category: "Cócteles",
    glb: "/models/cocktail.glb",
    usdz: "/models/cocktail.usdz",
    sizeM: 0.15,
    scale: 1,
    cameraOrbit: "-25deg 80deg 110%",
  },
  mojito: {
    label: "Mojito de Fresa",
    category: "Cócteles",
    glb: "/models/mojito.glb",
    usdz: "/models/mojito.usdz",
    sizeM: 0.16,
    scale: 1,
    cameraOrbit: "0deg 74deg 110%",
  },
  margarita: {
    label: "Margarita Maracuyá",
    category: "Cócteles",
    glb: "/models/margarita.glb",
    usdz: "/models/margarita.usdz",
    sizeM: 0.205,
    scale: 1,
    cameraOrbit: "-10deg 72deg 110%",
  },
  pina: {
    label: "Piña Colada Mareas",
    category: "Cócteles",
    glb: "/models/pina.glb",
    usdz: "/models/pina.usdz",
    sizeM: 0.1293,
    scale: 1,
    cameraOrbit: "15deg 72deg 110%",
  },
  antojos: {
    label: "Tacos / Antojos",
    category: "Antojos",
    glb: "/models/antojos.glb",
    usdz: "/models/antojos.usdz",
    sizeM: 0.27,
    scale: 1,
    cameraOrbit: "25deg 70deg 110%",
  },
  burger: {
    label: "Hamburguesa Gourmet",
    category: "Antojos",
    glb: "/models/burger.glb",
    usdz: "/models/burger.usdz",
    sizeM: 0.12,
    scale: 1,
    cameraOrbit: "-20deg 78deg 115%",
  },
  alitas: {
    label: "Alitas BBQ Miel",
    category: "Antojos",
    glb: "/models/alitas.glb",
    usdz: "/models/alitas.usdz",
    sizeM: 0.24,
    scale: 1,
    cameraOrbit: "0deg 60deg 115%",
  },
  nachos: {
    label: "Nachos del Faro",
    category: "Antojos",
    glb: "/models/nachos.glb",
    usdz: "/models/nachos.usdz",
    sizeM: 0.28,
    scale: 1,
    cameraOrbit: "20deg 62deg 115%",
  },
  papas: {
    label: "Papas Locas",
    category: "Antojos",
    glb: "/models/papas.glb",
    usdz: "/models/papas.usdz",
    sizeM: 0.162,
    scale: 1,
    cameraOrbit: "-20deg 66deg 115%",
  },
  seafood: {
    label: "Mariscos / Ceviche",
    category: "Mariscos",
    glb: "/models/seafood.glb",
    usdz: "/models/seafood.usdz",
    sizeM: 0.4,
    scale: 1,
    cameraOrbit: "-30deg 75deg 115%",
  },
  camarones: {
    label: "Camarones al Ajillo",
    category: "Mariscos",
    glb: "/models/camarones.glb",
    usdz: "/models/camarones.usdz",
    sizeM: 0.24,
    scale: 1,
    cameraOrbit: "0deg 58deg 115%",
  },
  ceviche: {
    label: "Ceviche Mareas",
    category: "Mariscos",
    glb: "/models/ceviche.glb",
    usdz: "/models/ceviche.usdz",
    sizeM: 0.23,
    scale: 1,
    cameraOrbit: "-15deg 70deg 115%",
  },
  grill: {
    label: "Parrillada / Cortes",
    category: "Mariscos",
    glb: "/models/grill.glb",
    usdz: "/models/grill.usdz",
    sizeM: 0.3,
    scale: 1,
    cameraOrbit: "20deg 72deg 120%",
  },
  beer: {
    label: "Cerveza / Tragos",
    category: "Cócteles",
    glb: "/models/beer.glb",
    usdz: "/models/beer.usdz",
    sizeM: 0.26,
    scale: 1,
    cameraOrbit: "-35deg 75deg 110%",
  },
  dessert: {
    label: "Postre / Café",
    category: "Antojos",
    glb: "/models/dessert.glb",
    usdz: "/models/dessert.usdz",
    sizeM: 0.15,
    scale: 1,
    cameraOrbit: "0deg 72deg 110%",
  },
  fruit: {
    label: "Frutas Tropicales",
    category: "Experiencias",
    glb: "/models/fruit.glb",
    usdz: "/models/fruit.usdz",
    sizeM: 0.12,
    scale: 1,
    cameraOrbit: "25deg 75deg 110%",
  },
  frutas: {
    label: "Tabla de Frutas",
    category: "Experiencias",
    glb: "/models/frutas.glb",
    usdz: "/models/frutas.usdz",
    sizeM: 0.29,
    scale: 1,
    cameraOrbit: "0deg 62deg 115%",
  },
  torta: {
    label: "Torta de Cumpleaños",
    category: "Experiencias",
    glb: "/models/torta.glb",
    usdz: "/models/torta.usdz",
    sizeM: 0.2,
    scale: 1,
    cameraOrbit: "0deg 64deg 115%",
  },
  lantern: {
    label: "Experiencia / Ambiente",
    category: "Experiencias",
    glb: "/models/lantern.glb",
    usdz: "/models/lantern.usdz",
    sizeM: 0.35,
    scale: 1,
    cameraOrbit: "-15deg 72deg 115%",
  },
};

// iosSrc con el fragmento que Quick Look necesita para el modo escala fija.
export function modelIosSrc(model) {
  const base = model?.usdz || "";
  if (!base) return "";
  return base.includes("#allowsContentScaling=") ? base : `${base}#allowsContentScaling=0`;
}

export const modelOptions = Object.entries(modelCatalog).map(([key, value]) => ({
  key,
  label: value.label,
  category: value.category,
  glb: value.glb,
  usdz: value.usdz,
  scale: value.scale,
  sizeM: value.sizeM,
  cameraOrbit: value.cameraOrbit,
}));

// Modelos del mismo platillo: permite sugerir alternativas en el visor 3D.
export function siblingModels(item) {
  if (!item) return [];
  const list = item.category
    ? modelOptions.filter((o) => o.category === item.category)
    : [];
  const unique = [...new Map(list.map((o) => [o.key, o])).values()];
  if (unique.length > 1) return unique;
  return modelOptions;
}

export function resolveModel(model) {
  if (!model) return null;
  if (modelCatalog[model]) return modelCatalog[model];
  const byGlb = modelOptions.find((o) => o.glb === model);
  if (byGlb) return modelCatalog[byGlb.key];
  return { label: "Modelo personalizado", glb: model, usdz: "", scale: 1, cameraOrbit: "0deg 75deg 105%" };
}