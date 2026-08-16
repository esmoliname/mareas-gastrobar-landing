<script setup>
import { computed, reactive, ref } from "vue";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Save,
  X,
  Box,
} from "lucide-vue-next";
import {
  catalog,
  menuCategories,
  addItem,
  updateItem,
  removeItem,
  toggleAvailability,
  togglePopular,
  resetCatalog,
} from "../../stores/catalog.js";
import { modelOptions } from "../../data/models3d.js";
import { formatColones } from "../../utils/format.js";
import { config } from "../../config/index.js";
import { notifyError, notifyInfo, notifySuccess } from "../../utils/toast.js";

const TAG_OPTIONS = ["Nuevo", "Popular", "Chef"];

const formOpen = ref(false);
const editingId = ref(null);
const form = reactive({
  name: "",
  category: menuCategories[0],
  price: "",
  description: "",
  image: "",
  model: modelOptions[0].glb,
  usdz: modelOptions[0].usdz,
  tags: [],
  popular: false,
  available: true,
});

const formTitle = computed(() => (editingId.value ? "Editar platillo" : "Nuevo platillo"));
const availableCount = computed(() => catalog.items.filter((i) => i.available).length);

function validateForm() {
  if (!form.name.trim()) return "El nombre del platillo es obligatorio.";
  if (form.name.trim().length > config.businessRules.maxNameLength) {
    return `El nombre no puede superar ${config.businessRules.maxNameLength} caracteres.`;
  }
  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) return "Ingresá un precio válido mayor a cero.";
  return "";
}

function toggleTag(tag) {
  if (form.tags.includes(tag)) {
    form.tags = form.tags.filter((t) => t !== tag);
  } else {
    form.tags = [...form.tags, tag];
  }
}

function onModelChange(key) {
  const opt = modelOptions.find((o) => o.key === key);
  if (!opt) return;
  form.model = opt.glb;
  if (!form.usdz) form.usdz = opt.usdz;
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, {
    name: "",
    category: menuCategories[0],
    price: "",
    description: "",
    image: "",
    model: modelOptions[0].glb,
    usdz: modelOptions[0].usdz,
    tags: [],
    popular: false,
    available: true,
  });
  formOpen.value = true;
}

function openEdit(item) {
  editingId.value = item.id;
  Object.assign(form, {
    name: item.name,
    category: item.category,
    price: String(item.price),
    description: item.description,
    image: item.image,
    model: item.model,
    usdz: item.usdz || "",
    tags: Array.isArray(item.tags) ? [...item.tags] : [],
    popular: item.popular,
    available: item.available,
  });
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
  editingId.value = null;
}

function submit() {
  const problem = validateForm();
  if (problem) {
    notifyError(problem);
    return;
  }
  const payload = { ...form };
  if (editingId.value) {
    updateItem(editingId.value, payload);
    notifySuccess("Platillo actualizado. Los cambios ya están visibles en el menú.");
  } else {
    addItem(payload);
    notifySuccess("Platillo agregado al catálogo.");
  }
  closeForm();
}

function onToggle(item) {
  toggleAvailability(item.id);
  notifySuccess(item.available ? `${item.name} ahora está disponible.` : `${item.name} marcado como agotado.`);
}

function onTogglePopular(item) {
  togglePopular(item.id);
  notifySuccess(item.popular ? `${item.name} ya no es popular.` : `${item.name} marcado como popular.`);
}

function onRemove(item) {
  removeItem(item.id);
  notifyInfo(`${item.name} fue eliminado del catálogo.`);
}

function onReset() {
  resetCatalog();
  notifySuccess("Catálogo restaurado a la versión original.");
}
</script>

<template>
  <section class="admin-card">
    <div class="admin-card__head">
      <div>
        <h2 class="admin-card__title">Gestor de Catálogo</h2>
        <p class="admin-card__subtitle">
          {{ catalog.items.length }} platillos · {{ availableCount }} disponibles en el menú digital.
          Los cambios se reflejan al instante en la landing.
        </p>
      </div>
      <div class="admin-card__actions">
        <button class="btn btn--ghost btn--sm" type="button" @click="onReset" title="Restaurar catálogo original">
          <RotateCcw :size="15" aria-hidden="true" />
          Restaurar
        </button>
        <button class="btn btn--primary btn--sm" type="button" @click="openCreate">
          <Plus :size="16" aria-hidden="true" />
          Agregar platillo
        </button>
      </div>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Platillo</th>
            <th>Categoría</th>
            <th class="admin-table__num">Precio</th>
            <th>Popular</th>
            <th>Estado</th>
            <th class="admin-table__actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in catalog.items" :key="item.id" :class="{ 'is-disabled': !item.available }">
            <td>
              <div class="admin-table__dish">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="admin-table__thumb" loading="lazy" decoding="async" />
                <div v-else class="admin-table__thumb admin-table__thumb--empty">
                  <Box :size="16" aria-hidden="true" />
                </div>
                <div>
                  <strong>{{ item.name }}</strong>
                  <span class="admin-table__hint">{{ item.description }}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="admin-table__tag">{{ item.category }}</span>
              <div v-if="item.tags && item.tags.length" class="admin-table__tags">
                <span v-for="tag in item.tags" :key="tag" class="admin-table__mini-tag">{{ tag }}</span>
              </div>
            </td>
            <td class="admin-table__num admin-table__price">{{ formatColones(item.price) }}</td>
            <td>
              <button
                class="admin-table__switch"
                :class="{ 'is-on': item.popular }"
                type="button"
                :aria-label="`Marcar ${item.name} como popular`"
                @click="onTogglePopular(item)"
              >
                <span></span>
              </button>
            </td>
            <td>
              <button
                class="admin-table__switch"
                :class="{ 'is-on': item.available }"
                type="button"
                :aria-label="`Cambiar disponibilidad de ${item.name}`"
                @click="onToggle(item)"
              >
                <span></span>
              </button>
              <span class="admin-table__state">{{ item.available ? "Disponible" : "Agotado" }}</span>
            </td>
            <td>
              <div class="admin-table__row-actions">
                <button class="icon-btn" type="button" :aria-label="`Editar ${item.name}`" @click="openEdit(item)">
                  <Pencil :size="15" />
                </button>
                <button
                  class="icon-btn icon-btn--danger"
                  type="button"
                  :aria-label="`Eliminar ${item.name}`"
                  @click="onRemove(item)"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!catalog.items.length" class="admin-table__empty">El catálogo está vacío. Agregá tu primer platillo.</p>
    </div>
  </section>

  <Teleport to="body">
    <Transition name="form">
      <div v-if="formOpen" class="form-modal" @click.self="closeForm">
        <form class="form-modal__panel" @submit.prevent="submit">
          <div class="form-modal__head">
            <h3>{{ formTitle }}</h3>
            <button class="icon-btn" type="button" aria-label="Cerrar formulario" @click="closeForm">
              <X :size="18" />
            </button>
          </div>

          <div class="form-modal__grid">
            <label class="field field--span2">
              <span>Nombre del platillo *</span>
              <input v-model="form.name" type="text" required placeholder="Ej: Tacos de Camarón Ensenada" />
            </label>

            <label class="field">
              <span>Categoría</span>
              <select v-model="form.category">
                <option v-for="c in menuCategories" :key="c" :value="c">{{ c }}</option>
              </select>
            </label>

            <label class="field">
              <span>Precio (₡)</span>
              <input v-model="form.price" type="number" min="0" step="100" inputmode="numeric" placeholder="6800" />
            </label>

            <label class="field field--span2">
              <span>Descripción</span>
              <textarea v-model="form.description" rows="2" placeholder="Ingredientes y estilo del platillo…"></textarea>
            </label>

            <label class="field field--span2">
              <span>URL de la fotografía (Unsplash)</span>
              <input v-model="form.image" type="url" placeholder="https://images.unsplash.com/photo-…" />
              <small class="field__hint">Dejalo vacío para mostrar el placeholder de la casa.</small>
            </label>

            <label class="field field--span2">
              <span>Modelo 3D (AR)</span>
              <select :value="modelOptions.find((o) => o.glb === form.model)?.key" @change="onModelChange($event.target.value)">
                <option v-for="opt in modelOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
                <option v-if="!modelOptions.some((o) => o.glb === form.model)" value="custom" disabled>Modelo personalizado</option>
              </select>
              <small class="field__hint">Cada categoría trae su modelo .glb y su versión .usdz para iOS (Apple Quick Look).</small>
            </label>

            <label class="field field--span2">
              <span>URL .glb (personalizada, opcional)</span>
              <input v-model="form.model" type="url" placeholder="https://…/modelo.glb" />
              <small class="field__hint">Si querés otro modelo, pegá aquí la URL directa del archivo .glb.</small>
            </label>

            <label class="field field--span2">
              <span>URL .usdz para iOS (opcional)</span>
              <input v-model="form.usdz" type="url" placeholder="https://…/modelo.usdz" />
              <small class="field__hint">Apple Quick Look abre el .usdz en iPhone/iPad. Dejalo vacío si no tenés versión iOS.</small>
            </label>

            <div class="field field--span2">
              <span>Etiquetas</span>
              <div class="tags-picker">
                <button
                  v-for="tag in TAG_OPTIONS"
                  :key="tag"
                  type="button"
                  class="tags-picker__chip"
                  :class="{ 'is-active': form.tags.includes(tag) }"
                  :aria-pressed="form.tags.includes(tag)"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
              <small class="field__hint">Se muestran como badges sobre la foto del platillo.</small>
            </div>

            <label class="check">
              <input v-model="form.popular" type="checkbox" />
              <span>Marcar como popular (badge 🔥)</span>
            </label>

            <label class="check">
              <input v-model="form.available" type="checkbox" />
              <span>Disponible en el menú</span>
            </label>
          </div>

          <div class="form-modal__foot">
            <button class="btn btn--ghost" type="button" @click="closeForm">
              <X :size="15" aria-hidden="true" />
              Cancelar
            </button>
            <button class="btn btn--primary" type="submit">
              <Save :size="16" aria-hidden="true" />
              {{ editingId ? "Guardar cambios" : "Agregar al catálogo" }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.admin-card {
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.08);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.admin-card__head {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

@media (min-width: 768px) {
  .admin-card__head {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.admin-card__title {
  font-size: 1.25rem;
}

.admin-card__subtitle {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.82rem;
}

.admin-card__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn--sm {
  min-height: 40px;
  padding: 8px 16px;
  font-size: 0.82rem;
}

.admin-table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid rgba(245, 239, 224, 0.08);
}

.admin-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.admin-table th {
  text-align: left;
  padding: 12px 14px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--bg-panel-2);
  border-bottom: 1px solid rgba(245, 239, 224, 0.08);
}

.admin-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(245, 239, 224, 0.06);
  vertical-align: middle;
}

.admin-table tbody tr:last-child td {
  border-bottom: 0;
}

.admin-table tbody tr:hover {
  background: rgba(46, 158, 91, 0.05);
}

.admin-table tbody tr.is-disabled {
  opacity: 0.55;
}

.admin-table__num {
  text-align: right;
}

.admin-table__actions-col {
  text-align: right;
}

.admin-table__dish {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 340px;
}

.admin-table__dish > div:last-child {
  min-width: 0;
}

.admin-table__dish strong {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-table__hint {
  display: block;
  color: var(--muted);
  font-size: 0.74rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-table__thumb {
  width: 52px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-panel-2);
}

.admin-table__thumb--empty {
  display: grid;
  place-items: center;
  color: var(--muted);
}

.admin-table__tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(46, 158, 91, 0.14);
  color: var(--green-bright);
  font-size: 0.74rem;
  font-weight: 600;
  white-space: nowrap;
}

.admin-table__tags {
  display: flex;
  gap: 5px;
  margin-top: 5px;
  flex-wrap: wrap;
}

.admin-table__mini-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(201, 162, 39, 0.12);
  border: 1px solid rgba(201, 162, 39, 0.3);
  color: var(--gold-light);
  font-size: 0.66rem;
  font-weight: 700;
  white-space: nowrap;
}

.tags-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tags-picker__chip {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(245, 239, 224, 0.16);
  background: var(--bg-panel-2);
  color: var(--sand);
  font-size: 0.82rem;
  font-weight: 600;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.tags-picker__chip:hover {
  border-color: var(--green-bright);
}

.tags-picker__chip.is-active {
  background: linear-gradient(135deg, var(--green), var(--green-bright));
  border-color: transparent;
  color: #fff;
}

.admin-table__price {
  font-weight: 600;
  color: var(--gold-light);
  white-space: nowrap;
}

.admin-table__row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(245, 239, 224, 0.14);
  background: transparent;
  color: var(--sand);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.icon-btn:hover {
  background: rgba(46, 158, 91, 0.16);
  color: var(--green-bright);
}

.icon-btn--danger:hover {
  background: rgba(232, 122, 93, 0.16);
  color: var(--coral);
}

.admin-table__switch {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(245, 239, 224, 0.2);
  background: var(--bg-panel-2);
  transition: background-color 0.2s ease;
  vertical-align: middle;
}

.admin-table__switch span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--muted);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.admin-table__switch.is-on {
  background: var(--green);
  border-color: var(--green-bright);
}

.admin-table__switch.is-on span {
  transform: translateX(18px);
  background: #fff;
}

.admin-table__state {
  margin-left: 8px;
  font-size: 0.74rem;
  color: var(--muted);
}

.admin-table__empty {
  padding: 32px;
  text-align: center;
  color: var(--muted);
}

/* Formulario */
.form-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(4, 8, 6, 0.8);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.form-modal__panel {
  width: min(100%, 620px);
  max-height: calc(100svh - 32px);
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: rgba(14, 26, 20, 0.85);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(245, 239, 224, 0.14);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  padding: 22px;
}

.form-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.form-modal__head h3 {
  font-size: 1.2rem;
}

.form-modal__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .form-modal__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sand);
}

.field--span2 {
  grid-column: 1 / -1;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.16);
  background: var(--bg-panel-2);
  color: var(--cream);
  font: inherit;
  font-weight: 400;
  outline: none;
  transition: border-color 0.2s ease;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--gold);
}

.field textarea {
  resize: vertical;
}

.field__hint {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.72rem;
}

.check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--sand);
  cursor: pointer;
  padding-block: 6px;
}

.check input {
  width: 18px;
  height: 18px;
  accent-color: var(--green);
}

.form-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(245, 239, 224, 0.08);
}

/* Transición */
.form-enter-active,
.form-leave-active {
  transition: opacity 0.2s ease;
}

.form-enter-active .form-modal__panel,
.form-leave-active .form-modal__panel {
  transition: transform 0.2s ease;
}

.form-enter-from,
.form-leave-to {
  opacity: 0;
}

.form-enter-from .form-modal__panel,
.form-leave-to .form-modal__panel {
  transform: translateY(14px);
}
</style>