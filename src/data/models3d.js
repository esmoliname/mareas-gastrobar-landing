// Catálogo de assets 3D gastronómicos, self-hosted en /public/models/.
// Cada entrada expone:
//   - glb    : ruta local del binario glTF (.glb) para WebXR / Scene Viewer / visor 3D
//   - usdz   : ruta local del binario USDZ para Apple Quick Look (iOS)
//   - iosSrc : usdz + fragmento #allowsContentScaling=0 (Quick Look respeta el
//              tamaño real y deshabilita el reescalado con pellizco)
//   - sizeM  : tamaño físico real objetivo en metros (para ar-scale="fixed")
//   - scale  : factor que normaliza las unidades de autoría de cada GLB (varían
//              por modelo) para que el platillo se vea a su escala real de mesa
//   - cameraOrbit: ángulo inicial óptimo para resaltar el volumen del platillo
//
// Origen de cada asset (descargado una sola vez y versionado en el repo para
// eliminar dependencias de CDNs externos y fallos de CORS en iOS):
//   - burger / dessert / steak: github.com/Yasirpyro/demo (glb + usdz emparejados)
//   - pizza / antojos:          github.com/Sauravdas1998/ar-food-models (glb)
//   - seafood / cocktail / beer / fruit / lantern: Khronos glTF-Sample-Assets (glb)
//   - usdz de Pizza, copas, pez, carne, cerveza, fruta y linterna:
//                               Google "Beautiful Things" / storage.googleapis.com
//   - grill: modelviewer.dev shared-assets (shishkebab.glb)

export const modelCatalog = {
  burger: {
    label: "Hamburguesa Gourmet",
    glb: "/models/burger.glb",
    usdz: "/models/burger.usdz",
    sizeM: 0.12,
    scale: 0.0166,
    cameraOrbit: "-20deg 78deg 115%",
  },
  pizza: {
    label: "Pizza Artesanal",
    glb: "/models/pizza.glb",
    usdz: "/models/pizza.usdz",
    sizeM: 0.35,
    scale: 0.0656,
    cameraOrbit: "0deg 72deg 120%",
  },
  antojos: {
    label: "Tacos / Antojos",
    glb: "/models/antojos.glb",
    usdz: "/models/antojos.usdz",
    sizeM: 0.27,
    scale: 0.135,
    cameraOrbit: "25deg 70deg 110%",
  },
  cocktail: {
    label: "Cóctel Tropical",
    glb: "/models/cocktail.glb",
    usdz: "/models/cocktail.usdz",
    sizeM: 0.15,
    scale: 1,
    cameraOrbit: "-25deg 80deg 110%",
  },
  seafood: {
    label: "Mariscos / Ceviche",
    glb: "/models/seafood.glb",
    usdz: "/models/seafood.usdz",
    sizeM: 0.4,
    scale: 0.62,
    cameraOrbit: "-30deg 75deg 115%",
  },
  grill: {
    label: "Parrillada / Cortes",
    glb: "/models/grill.glb",
    usdz: "/models/grill.usdz",
    sizeM: 0.3,
    scale: 0.00267,
    cameraOrbit: "20deg 72deg 120%",
  },
  beer: {
    label: "Cerveza / Tragos",
    glb: "/models/beer.glb",
    usdz: "/models/beer.usdz",
    sizeM: 0.26,
    scale: 1,
    cameraOrbit: "-35deg 75deg 110%",
  },
  dessert: {
    label: "Postre / Café",
    glb: "/models/dessert.glb",
    usdz: "/models/dessert.usdz",
    sizeM: 0.15,
    scale: 1,
    cameraOrbit: "0deg 72deg 110%",
  },
  fruit: {
    label: "Frutas Tropicales",
    glb: "/models/fruit.glb",
    usdz: "/models/fruit.usdz",
    sizeM: 0.12,
    scale: 1.9,
    cameraOrbit: "25deg 75deg 110%",
  },
  lantern: {
    label: "Experiencia / Ambiente",
    glb: "/models/lantern.glb",
    usdz: "/models/lantern.usdz",
    sizeM: 0.35,
    scale: 0.0136,
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
  glb: value.glb,
  usdz: value.usdz,
  scale: value.scale,
  sizeM: value.sizeM,
  cameraOrbit: value.cameraOrbit,
}));

export function resolveModel(model) {
  if (!model) return null;
  if (modelCatalog[model]) return modelCatalog[model];
  const byGlb = modelOptions.find((o) => o.glb === model);
  if (byGlb) return modelCatalog[byGlb.key];
  return { label: "Modelo personalizado", glb: model, usdz: "", scale: 1, cameraOrbit: "0deg 75deg 105%" };
}
