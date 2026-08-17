<script setup>
import { computed, ref } from "vue";
import { catalog } from "../../stores/catalog.js";
import { removeItem, resetCatalog, toggleAvailability, togglePopular } from "../../stores/catalog.js";
import { audit } from "../../utils/audit.js";
import { notifyInfo, notifySuccess } from "../../utils/toast.js";
import AdminCard from "../ui/AdminCard.vue";
import ConfirmDialog from "../ui/ConfirmDialog.vue";
import CatalogToolbar from "./catalog/CatalogToolbar.vue";
import CatalogTable from "./catalog/CatalogTable.vue";
import DishFormModal from "./catalog/DishFormModal.vue";
import { useDishForm } from "../../composables/useDishForm.js";

const dish = useDishForm();

const query = ref("");
const deleteTarget = ref(null);
const resetOpen = ref(false);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return catalog.items;
  return catalog.items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(q))
  );
});

const availableCount = computed(() => catalog.items.filter((i) => i.available).length);

function onToggleAvailable(item) {
  toggleAvailability(item.id);
  notifySuccess(item.available ? `${item.name} marcado como agotado.` : `${item.name} ahora está disponible.`);
}

function onTogglePopular(item) {
  togglePopular(item.id);
  notifySuccess(item.popular ? `${item.name} ya no es popular.` : `${item.name} marcado como popular.`);
}

function requestDelete(item) {
  deleteTarget.value = item;
}

function confirmDelete() {
  const item = deleteTarget.value;
  if (!item) return;
  removeItem(item.id);
  audit("catalog.remove", item.name);
  notifyInfo(`${item.name} fue eliminado del catálogo.`);
  deleteTarget.value = null;
}

function confirmReset() {
  resetCatalog();
  audit("catalog.reset", `${catalog.items.length} platillos restaurados`);
  notifySuccess("Catálogo restaurado a la versión original.");
  resetOpen.value = false;
}
</script>

<template>
  <AdminCard
    title="Gestor de Catálogo"
    :subtitle="`${catalog.items.length} platillos · ${availableCount} disponibles en el menú digital. Los cambios se reflejan al instante en la landing.`"
  >
    <CatalogToolbar
      v-model:query="query"
      :total="catalog.items.length"
      :available="availableCount"
      @create="dish.openCreate"
      @reset="resetOpen = true"
    />

    <CatalogTable
      :items="filtered"
      @toggle-available="onToggleAvailable"
      @toggle-popular="onTogglePopular"
      @edit="dish.openEdit"
      @remove="requestDelete"
    />
  </AdminCard>

  <DishFormModal
    :open="dish.open"
    :editing="Boolean(dish.editingId)"
    :title="dish.title"
    :categories="dish.categories"
    :form="dish.form"
    :errors="dish.errors"
    :price-preview="dish.pricePreview"
    :model-groups="dish.modelGroups"
    @close="dish.close"
    @submit="dish.submit"
    @model-change="dish.onModelChange"
    @toggle-tag="dish.toggleTag"
  />

  <ConfirmDialog
    :open="Boolean(deleteTarget)"
    title="Eliminar platillo"
    :message="`¿Eliminar “${deleteTarget?.name || ''}” del catálogo? Esta acción no se puede deshacer.`"
    confirm-label="Eliminar"
    danger
    @confirm="confirmDelete"
    @cancel="deleteTarget = null"
  />

  <ConfirmDialog
    :open="resetOpen"
    title="Restaurar catálogo"
    message="Se reemplazará el catálogo actual por la versión original del menú. Los cambios hechos se perderán."
    confirm-label="Restaurar"
    @confirm="confirmReset"
    @cancel="resetOpen = false"
  />
</template>