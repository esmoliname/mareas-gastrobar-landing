// Catálogo dinámico de assets 3D para gastronomía.
// Cada entrada expone versión .glb (WebXR / Scene Viewer / visor 3D)
// y versión .usdz (Apple Quick Look en iOS) cuando está disponible.
//
// Todas las URLs fueron verificadas (HTTP 200) al momento de escribir este archivo:
//   - github.com/KhronosGroup/glTF-Sample-Assets (modelos oficiales de alta fidelidad: pez barramundi, taza de vidrio)
//   - github.com/Sauravdas1998/ar-food-models (glb gastronómicos)
//   - three.js examples / glTF-Sample-Models de Khronos (glb)
//   - modelviewer.dev (modelos oficiales del visor de Google)
//   - Google "Beautiful Things" / Apple Quick Look (usdz)
//
// Escala 1:1 en AR: `sizeM` es el tamaño real objetivo (metros) y `scale` el factor
// que normaliza las unidades de autoría del GLB (varían por modelo) para que
// ar-scale="fixed" muestre el platillo a su tamaño físico. Los factores se
// calcularon parseando la caja de cada GLB (accessors POSITION, min/max).

export const modelCatalog = {
  burger: {
    label: "Hamburguesa",
    glb: "https://raw.githubusercontent.com/Sauravdas1998/ar-food-models/main/burger.glb",
    usdz: "https://raw.githubusercontent.com/Yasirpyro/demo/main/burger.usdz",
    sizeM: 0.12,
    scale: 0.0166,
  },
  pizza: {
    label: "Pizza",
    glb: "https://raw.githubusercontent.com/Sauravdas1998/ar-food-models/main/pizza.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/Pizza.usdz",
    sizeM: 0.35,
    scale: 0.0656,
  },
  pasta: {
    label: "Plato principal / guisado",
    glb: "https://raw.githubusercontent.com/Sauravdas1998/ar-food-models/main/pasta.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1369_ambientcg_preview__3d_bread_005.usdz",
    sizeM: 0.27,
    scale: 0.135,
  },
  dish: {
    label: "Pez fresco / mariscos",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1188_fish_bro.usdz",
    sizeM: 0.4,
    scale: 0.62,
  },
  skewer: {
    label: "Parrillada / cortes",
    glb: "https://modelviewer.dev/shared-assets/models/shishkebab.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1157_proteinacarne_v4.usdz",
    sizeM: 0.3,
    scale: 0.00267,
  },
  bottle: {
    label: "Cóctel / botella",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/Asahi_Beer_Can.usdz",
    sizeM: 0.26,
    scale: 1,
  },
  mug: {
    label: "Taza / bebida caliente",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionTeacup/glTF-Binary/DiffuseTransmissionTeacup.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1168_japanese_tea_cup.usdz",
    sizeM: 0.15,
    scale: 1,
  },
  fruit: {
    label: "Fruta tropical",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1574_banana.usdz",
    sizeM: 0.12,
    scale: 1.9,
  },
  lantern: {
    label: "Experiencia / ambiente",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1183_lantern.usdz",
    sizeM: 0.35,
    scale: 0.0136,
  },
};

export const modelOptions = Object.entries(modelCatalog).map(([key, value]) => ({
  key,
  label: value.label,
  glb: value.glb,
  usdz: value.usdz,
  scale: value.scale,
  sizeM: value.sizeM,
}));

export function resolveModel(model) {
  if (!model) return null;
  if (modelCatalog[model]) return modelCatalog[model];
  const external = modelOptions.find((o) => o.glb === model);
  if (external) return external;
  return { label: "Modelo personalizado", glb: model, usdz: "", scale: 1 };
}