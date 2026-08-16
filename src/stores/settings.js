import { reactive, watch } from "vue";
import { storageGetJSON, storageSetJSON } from "../utils/storage.js";

const STORAGE_KEY = "mareas:settings:v1";

const themes = {
  tropical: {
    label: "Tropical (verde palmera)",
    green: "#1e7a46",
    greenBright: "#2e9e5b",
    gold: "#c9a227",
  },
  dorado: {
    label: "Dorado Pacifico",
    green: "#3d7a1e",
    greenBright: "#5b9e2e",
    gold: "#e0b437",
  },
  sunset: {
    label: "Coral Sunset",
    green: "#1e6a6b",
    greenBright: "#2e9e9b",
    gold: "#e0a037",
  },
};

const saved = storageGetJSON(STORAGE_KEY);

export const settings = reactive({
  theme: saved?.theme && themes[saved.theme] ? saved.theme : "tropical",
  banner: {
    enabled: saved?.banner?.enabled ?? false,
    text: saved?.banner?.text ?? "¡Noches de maridaje todos los viernes!",
  },
});

export const themeOptions = themes;

export function setTheme(name) {
  if (themes[name]) settings.theme = name;
}

export function setBanner(patch) {
  settings.banner = { ...settings.banner, ...patch };
}

export function applyTheme() {
  const t = themes[settings.theme];
  if (!t) return;
  const root = document.documentElement;
  root.style.setProperty("--green", t.green);
  root.style.setProperty("--green-bright", t.greenBright);
  root.style.setProperty("--gold", t.gold);
  root.style.setProperty("--gold-light", t.gold);
}

watch(
  settings,
  (value) => {
    storageSetJSON(STORAGE_KEY, value);
    applyTheme();
  },
  { deep: true }
);