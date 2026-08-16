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

export const modelCatalog = {
  burger: {
    label: "Hamburguesa",
    glb: "https://raw.githubusercontent.com/Sauravdas1998/ar-food-models/main/burger.glb",
    usdz: "https://raw.githubusercontent.com/Yasirpyro/demo/main/burger.usdz",
  },
  pizza: {
    label: "Pizza",
    glb: "https://raw.githubusercontent.com/Sauravdas1998/ar-food-models/main/pizza.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/Pizza.usdz",
  },
  pasta: {
    label: "Plato principal / guisado",
    glb: "https://raw.githubusercontent.com/Sauravdas1998/ar-food-models/main/pasta.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1369_ambientcg_preview__3d_bread_005.usdz",
  },
  dish: {
    label: "Pez fresco / mariscos",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1188_fish_bro.usdz",
  },
  skewer: {
    label: "Parrillada / cortes",
    glb: "https://modelviewer.dev/shared-assets/models/shishkebab.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1157_proteinacarne_v4.usdz",
  },
  bottle: {
    label: "Cóctel / botella",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/Asahi_Beer_Can.usdz",
  },
  mug: {
    label: "Taza / bebida caliente",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionTeacup/glTF-Binary/DiffuseTransmissionTeacup.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1168_japanese_tea_cup.usdz",
  },
  fruit: {
    label: "Fruta tropical",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1574_banana.usdz",
  },
  lantern: {
    label: "Experiencia / ambiente",
    glb: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb",
    usdz: "https://storage.googleapis.com/beautiful-things-main/Things-USDZ/models/BT1183_lantern.usdz",
  },
};

export const modelOptions = Object.entries(modelCatalog).map(([key, value]) => ({
  key,
  label: value.label,
  glb: value.glb,
  usdz: value.usdz,
}));

export function resolveModel(model) {
  if (!model) return null;
  if (modelCatalog[model]) return modelCatalog[model];
  const external = modelOptions.find((o) => o.glb === model);
  if (external) return external;
  return { label: "Modelo personalizado", glb: model, usdz: "" };
}