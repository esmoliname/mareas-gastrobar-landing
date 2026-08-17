<script setup>
import { Box, Pencil, Trash2 } from "lucide-vue-next";
import { formatColones } from "../../../utils/format.js";
import ToggleSwitch from "../../ui/ToggleSwitch.vue";

defineProps({
  items: { type: Array, default: () => [] },
});

const emit = defineEmits(["toggle-available", "toggle-popular", "edit", "remove"]);
</script>

<template>
  <div class="adm-table-wrap">
    <table class="adm-table">
      <thead>
        <tr>
          <th>Platillo</th>
          <th>Categoría</th>
          <th class="adm-table__num">Precio</th>
          <th>Popular</th>
          <th>Estado</th>
          <th class="adm-table__actions-col">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" :class="{ 'is-disabled': !item.available }">
          <td>
            <div class="adm-table__dish">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="adm-table__thumb" loading="lazy" decoding="async" />
              <div v-else class="adm-table__thumb adm-table__thumb--empty">
                <Box :size="16" aria-hidden="true" />
              </div>
              <div>
                <strong>{{ item.name }}</strong>
                <span class="adm-table__hint">{{ item.description }}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="adm-table__tag">{{ item.category }}</span>
            <div v-if="item.tags && item.tags.length" class="adm-table__tags">
              <span v-for="tag in item.tags" :key="tag" class="adm-table__mini-tag">{{ tag }}</span>
            </div>
          </td>
          <td class="adm-table__num adm-table__price">{{ formatColones(item.price) }}</td>
          <td>
            <ToggleSwitch
              :model-value="item.popular"
              label="Marcar como popular"
              on-label="Popular"
              off-label="Normal"
              @update:model-value="emit('toggle-popular', item)"
            />
          </td>
          <td>
            <ToggleSwitch
              :model-value="item.available"
              label="Cambiar disponibilidad"
              on-label="Disponible"
              off-label="Agotado"
              @update:model-value="emit('toggle-available', item)"
            />
          </td>
          <td>
            <div class="adm-table__row-actions">
              <button class="adm-icon-btn" type="button" :aria-label="`Editar ${item.name}`" @click="emit('edit', item)">
                <Pencil :size="15" />
              </button>
              <button
                class="adm-icon-btn adm-icon-btn--danger"
                type="button"
                :aria-label="`Eliminar ${item.name}`"
                @click="emit('remove', item)"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!items.length" class="adm-table__empty">
      No se encontraron platillos con ese filtro.
    </p>
  </div>
</template>