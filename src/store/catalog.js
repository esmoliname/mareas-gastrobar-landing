import { reactive } from "vue";
import { seedMenu, categories } from "../data/menu.js";

const STORAGE_KEY = "mareas:catalog:v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(seedMenu);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(seedMenu);
  } catch {
    return structuredClone(seedMenu);
  }
}

export const catalog = reactive({ items: load() });

export const menuCategories = categories;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog.items));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function addItem(item) {
  const id =
    item.id || `${item.category.toLowerCase()}-${Date.now().toString(36)}`;
  catalog.items.unshift({
    id,
    name: item.name,
    description: item.description || "",
    price: Number(item.price) || 0,
    category: categories.includes(item.category) ? item.category : categories[0],
    image: item.image || "",
    model: item.model || "",
    popular: Boolean(item.popular),
    available: item.available !== false,
  });
  persist();
}

export function updateItem(id, patch) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) return;
  Object.assign(item, {
    name: patch.name ?? item.name,
    description: patch.description ?? item.description,
    price: patch.price !== undefined ? Number(patch.price) || 0 : item.price,
    category: patch.category !== undefined && categories.includes(patch.category) ? patch.category : item.category,
    image: patch.image !== undefined ? patch.image : item.image,
    model: patch.model !== undefined ? patch.model : item.model,
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