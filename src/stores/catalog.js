import { reactive } from "vue";
import { seedMenu, categories } from "../data/menu.js";
import { config } from "../config/index.js";
import { sanitizeDigits, sanitizeTags, sanitizeText, sanitizeUrl, validateFields } from "../utils/validation.js";
import { audit } from "../utils/audit.js";
import { storageGetJSON, storageSetJSON } from "../utils/storage.js";

// v2: el catálogo ahora mapea un modelo 3D dedicado por platillo (20 familias).
// El bump invalida catálogos persistidos con el mapeo genérico anterior.
const STORAGE_KEY = "mareas:catalog:v2";

const MAX_NAME = config.businessRules.maxNameLength;
const MAX_DESC = config.businessRules.maxDescriptionLength;

function load() {
  const parsed = storageGetJSON(STORAGE_KEY);
  return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(seedMenu);
}

export const catalog = reactive({ items: load() });

export const menuCategories = categories;

function persist() {
  storageSetJSON(STORAGE_KEY, catalog.items);
}

// Sincronización entre pestañas: si el admin edita en otra pestaña/ventana,
// la vista del cliente se actualiza al instante sin recargar.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    const parsed = storageGetJSON(STORAGE_KEY);
    if (Array.isArray(parsed)) catalog.items = parsed;
  });
}

// Un único punto de saneamiento para altas y bajas: el input del admin nunca
// llega directo al catálogo. Retorna { ok, errors } para la UI del formulario.
export function sanitizeDish(input) {
  const rules = {
    name: "required|maxLength:80",
    price: "required|numberRange:1,1000000",
    category: "required",
    image: "optional|httpUrl",
    model: "optional|httpUrl",
    usdz: "optional|httpUrl",
  };
  const errors = validateFields(rules, input);

  const category = categories.includes(String(input.category || "")) ? String(input.category) : categories[0];

  return {
    ok: !Object.keys(errors).length,
    errors,
    dish: {
      name: sanitizeText(input.name, MAX_NAME) || "Sin nombre",
      description: sanitizeText(input.description, MAX_DESC),
      price: Math.max(0, Number(input.price) || 0),
      category,
      image: sanitizeUrl(input.image),
      model: sanitizeUrl(input.model),
      usdz: sanitizeUrl(input.usdz),
      tags: sanitizeTags(input.tags),
      popular: Boolean(input.popular),
      available: input.available !== false,
    },
  };
}

export function addItem(item) {
  const id = String(item.id || `${item.category.toLowerCase()}-${Date.now().toString(36)}`);
  catalog.items.unshift({ id, ...item });
  persist();
  audit("catalog.create", item.name);
  return id;
}

export function updateItem(id, patch) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) return;
  Object.assign(item, patch);
  persist();
  audit("catalog.update", item.name);
}

export function toggleAvailability(id) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) return;
  item.available = !item.available;
  persist();
  audit("catalog.toggle", `${item.name}: ${item.available ? "disponible" : "agotado"}`);
}

export function togglePopular(id) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) return;
  item.popular = !item.popular;
  persist();
}

export function removeItem(id) {
  const item = catalog.items.find((i) => i.id === id);
  catalog.items = catalog.items.filter((i) => i.id !== id);
  persist();
  audit("catalog.remove", item?.name || id);
}

export function resetCatalog() {
  catalog.items = structuredClone(seedMenu);
  persist();
}