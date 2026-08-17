<script setup>
import { Search, RotateCcw, Plus } from "lucide-vue-next";

defineProps({
  total: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  query: { type: String, default: "" },
});

const emit = defineEmits(["update:query", "create", "reset"]);
</script>

<template>
  <div class="adm-toolbar">
    <div class="adm-toolbar__search" role="search">
      <Search :size="16" class="adm-toolbar__search-icon" aria-hidden="true" />
      <input
        :value="query"
        type="search"
        placeholder="Buscar por nombre, categoría o etiqueta…"
        aria-label="Buscar platillos en el catálogo"
        autocomplete="off"
        @input="emit('update:query', $event.target.value)"
      />
    </div>
    <div class="adm-card__actions">
      <span class="adm-toolbar__count">{{ available }} de {{ total }} disponibles</span>
      <button class="btn btn--ghost adm-btn--sm" type="button" title="Restaurar catálogo original" @click="emit('reset')">
        <RotateCcw :size="15" aria-hidden="true" />
        Restaurar
      </button>
      <button class="btn btn--primary adm-btn--sm" type="button" @click="emit('create')">
        <Plus :size="16" aria-hidden="true" />
        Agregar platillo
      </button>
    </div>
  </div>
</template>