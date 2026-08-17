import { ref, computed } from "vue";
import { resolveModel, modelIosSrc } from "../data/models3d.js";

// Estado global del visor 3D/RA: cualquier sección puede abrir el modal con
// arStore.open(item). Centralizar aquí permite que ArModal se monte una sola
// vez (en HomeView) y que la galería 3D y el menú compartan la misma sesión.
export const arStore = (() => {
  const item = ref(null);
  const modelKey = ref("");
  const source = ref("");

  const open = computed(() => Boolean(item.value));

  const resolved = computed(() => (item.value ? resolveModel(modelKey.value || item.value.model) : null));

  const iosSrc = computed(() => {
    const base = item.value?.usdz || resolved.value?.usdz || "";
    if (!base) return undefined;
    return modelIosSrc({ usdz: base });
  });

  function openItem(dish, src = "") {
    item.value = dish;
    modelKey.value = dish?.model || "";
    source.value = src;
  }

  function switchModel(key) {
    if (!modelKey.value) return;
    modelKey.value = key;
  }

  function close() {
    item.value = null;
    modelKey.value = "";
    source.value = "";
  }

  return { item, modelKey, source, open, resolved, iosSrc, openItem, switchModel, close };
})();