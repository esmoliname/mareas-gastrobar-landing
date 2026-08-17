<script setup>
import { ref } from "vue";
import { Loader2, Save, ScanLine, X } from "lucide-vue-next";
import { formatColones } from "../../../utils/format.js";
import { loadViewer } from "../../../utils/viewer.js";
import { notifyError } from "../../../utils/toast.js";
import { LIMITS } from "../../../utils/validation.js";
import ModalDialog from "../../ui/ModalDialog.vue";
import FormField from "../../ui/FormField.vue";
import TagPicker from "../../ui/TagPicker.vue";

defineProps({
  open: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
  title: { type: String, default: "" },
  categories: { type: Array, default: () => [] },
  form: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  pricePreview: { type: Number, default: 0 },
  modelGroups: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "submit", "model-change", "toggle-tag"]);

const TAG_OPTIONS = ["Nuevo", "Popular", "Chef"];

// Vista previa 3D lazy: el bundle de model-viewer solo se descarga la
// primera vez que se activa.
const previewOpen = ref(false);
const previewReady = ref(false);
const previewError = ref(false);

async function togglePreview() {
  previewOpen.value = !previewOpen.value;
  if (!previewOpen.value || previewReady.value) return;
  previewError.value = false;
  try {
    await loadViewer();
    previewReady.value = true;
  } catch {
    previewError.value = true;
    notifyError("No se pudo cargar el visor 3D.");
  }
}
</script>

<template>
  <ModalDialog :open="open" :title="title" aria-label="Formulario de platillo" @close="emit('close')">
    <form class="adm-form-grid" novalidate @submit.prevent="emit('submit')">
      <FormField
        label="Nombre del platillo"
        :error="errors.name"
        required
        span2
      >
        <template #default="{ id }">
          <input :id="id" v-model="form.name" type="text" maxlength="80" placeholder="Ej: Tacos de Camarón Ensenada" />
        </template>
      </FormField>

      <FormField label="Categoría">
        <template #default="{ id }">
          <select :id="id" v-model="form.category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </template>
      </FormField>

      <FormField label="Precio (₡)" :error="errors.price" required>
        <template #default="{ id }">
          <input :id="id" v-model="form.price" type="number" min="1" step="100" inputmode="numeric" placeholder="6800" />
        </template>
        <template #hint>
          <span v-if="pricePreview > 0">Vista previa: {{ formatColones(pricePreview) }}</span>
        </template>
      </FormField>

      <FormField label="Descripción" span2>
        <template #default="{ id }">
          <textarea :id="id" v-model="form.description" rows="2" maxlength="280" placeholder="Ingredientes y estilo del platillo…"></textarea>
        </template>
        <template #hint>
          <span class="adm-field__counter">{{ form.description.length }}/{{ LIMITS.description }}</span>
        </template>
      </FormField>

      <FormField label="URL de la fotografía (Unsplash)" :error="errors.image" span2>
        <template #default="{ id }">
          <input :id="id" v-model="form.image" type="url" placeholder="https://images.unsplash.com/photo-…" />
        </template>
        <template #hint>Dejalo vacío para mostrar el placeholder de la casa.</template>
      </FormField>

      <FormField label="Modelo 3D (AR)" :error="errors.model" span2>
        <template #default="{ id }">
          <select :id="id" :value="modelGroups.flatMap(([, opts]) => opts).find((o) => o.glb === form.model)?.key" @change="emit('model-change', $event.target.value)">
            <optgroup v-for="[cat, opts] in modelGroups" :key="cat" :label="cat">
              <option v-for="opt in opts" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
            </optgroup>
            <option v-if="!modelGroups.flatMap(([, opts]) => opts).some((o) => o.glb === form.model)" value="custom" disabled>
              Modelo personalizado
            </option>
          </select>
        </template>
        <template #hint>Cada platillo trae su modelo .glb y su .usdz para iOS (Apple Quick Look).</template>
      </FormField>

      <FormField label="URL .glb (personalizada, opcional)" :error="errors.model" span2>
        <template #default="{ id }">
          <input :id="id" v-model="form.model" type="url" placeholder="https://…/modelo.glb" />
        </template>
        <template #hint>Si querés otro modelo, pegá aquí la URL directa del archivo .glb.</template>
      </FormField>

      <FormField label="URL .usdz para iOS (opcional)" :error="errors.usdz" span2>
        <template #default="{ id }">
          <input :id="id" v-model="form.usdz" type="url" placeholder="https://…/modelo.usdz" />
        </template>
        <template #hint>Apple Quick Look abre el .usdz en iPhone/iPad. Dejalo vacío si no tenés versión iOS.</template>
      </FormField>

      <div class="adm-field adm-field--span2">
        <button class="btn btn--ghost adm-btn--sm" type="button" :aria-expanded="previewOpen" @click="togglePreview">
          <ScanLine :size="14" aria-hidden="true" />
          {{ previewOpen ? "Ocultar vista previa 3D" : "Ver vista previa 3D" }}
        </button>
        <div v-if="previewOpen" class="dish-preview3d">
          <model-viewer
            v-if="previewReady && form.model"
            :src="form.model"
            camera-controls
            auto-rotate
            auto-rotate-delay="0"
            shadow-intensity="1.4"
            shadow-softness="0.6"
            tone-mapping="aces"
            environment-image="neutral"
            class="dish-preview3d__viewer"
          ></model-viewer>
          <p v-else-if="previewError" class="dish-preview3d__msg">No se pudo cargar el visor 3D en este navegador.</p>
          <p v-else class="dish-preview3d__msg">
            <Loader2 :size="16" class="dish-preview3d__spin" aria-hidden="true" />
            Cargando visor 3D…
          </p>
        </div>
      </div>

      <TagPicker
        v-model="form.tags"
        :options="TAG_OPTIONS"
        label="Etiquetas"
        hint="Se muestran como badges sobre la foto del platillo."
        span2
      />

      <label class="adm-check adm-field--span2">
        <input v-model="form.popular" type="checkbox" />
        <span>Marcar como popular (badge)</span>
      </label>

      <label class="adm-check adm-field--span2">
        <input v-model="form.available" type="checkbox" />
        <span>Disponible en el menú</span>
      </label>
    </form>

    <template #footer>
      <button class="btn btn--ghost" type="button" @click="emit('close')">
        <X :size="15" aria-hidden="true" />
        Cancelar
      </button>
      <button class="btn btn--primary" type="button" @click="emit('submit')">
        <Save :size="16" aria-hidden="true" />
        {{ editing ? "Guardar cambios" : "Agregar al catálogo" }}
      </button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.dish-preview3d {
  margin-top: 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(245, 239, 224, 0.1);
  background: #0b1210;
  overflow: hidden;
}

.dish-preview3d__viewer {
  display: block;
  width: 100%;
  height: 260px;
}

.dish-preview3d__msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 260px;
  margin: 0;
  color: var(--muted);
  font-size: 0.82rem;
}

.dish-preview3d__spin {
  color: var(--gold-light);
  animation: dish-preview3d-spin 1s linear infinite;
}

@keyframes dish-preview3d-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>