import { reactive } from "vue";
import { seedMenu, categories } from "../data/menu.js";
import { config } from "../config/index.js";
import { storageGetJSON, storageSetJSON } from "../utils/storage.js";

// v2: el catálogo ahora mapea un modelo 3D dedicado por platillo (20 familias).
// El bump invalida catálogos persistidos con el mapeo genérico anterior.
const STORAGE_KEY = "mareas:catalog:v2";

const MAX_NAME = config.businessRules.maxNameLength;
const MAX_DESC = config.businessRules.maxDescriptionLength;

function sanitizeText(value, max) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, window.location.origin);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => sanitizeText(t, 24))
    .filter(Boolean)
    .slice(0, 4);
}

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

export function addItem(item) {
  const category = categories.includes(item.category) ? item.category : categories[0];
  const id = String(item.id || `${category.toLowerCase()}-${Date.now().toString(36)}`);
  catalog.items.unshift({
    id,
    name: sanitizeText(item.name, MAX_NAME) || "Sin nombre",
    description: sanitizeText(item.description, MAX_DESC),
    price: Math.max(0, Number(item.price) || 0),
    category,
    image: sanitizeUrl(item.image),
    model: sanitizeUrl(item.model),
    usdz: sanitizeUrl(item.usdz),
    tags: sanitizeTags(item.tags),
    popular: Boolean(item.popular),
    available: item.available !== false,
  });
  persist();
}

export function updateItem(id, patch) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) return;
  Object.assign(item, {
    name: patch.name !== undefined ? sanitizeText(patch.name, MAX_NAME) || item.name : item.name,
    description: patch.description !== undefined ? sanitizeText(patch.description, MAX_DESC) : item.description,
    price: patch.price !== undefined ? Math.max(0, Number(patch.price) || 0) : item.price,
    category: patch.category !== undefined && categories.includes(patch.category) ? patch.category : item.category,
    image: patch.image !== undefined ? sanitizeUrl(patch.image) : item.image,
    model: patch.model !== undefined ? sanitizeUrl(patch.model) : item.model,
    usdz: patch.usdz !== undefined ? sanitizeUrl(patch.usdz) : item.usdz,
    tags: patch.tags !== undefined ? sanitizeTags(patch.tags) : item.tags,
    popular: patch.popular !== undefined ? Boolean(patch.popular) : item.popular,
    available: patch.available !== undefined ? Boolean(patch.available) : item.available,
  });
  persist();
}

export function toggleAvailability(id) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) return;
  item.available = !item.available;
  persist();
}

export function togglePopular(id) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) return;
  item.popular = !item.popular;
  persist();
}

export function removeItem(id) {
  catalog.items = catalog.items.filter((i) => i.id !== id);
  persist();
}

export function resetCatalog() {
  catalog.items = structuredClone(seedMenu);
  persist();
}