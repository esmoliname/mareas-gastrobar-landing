<script setup>
import { computed } from "vue";
import { Palette, Megaphone, RotateCcw, ExternalLink } from "lucide-vue-next";
import { settings, themeOptions, setTheme, setBanner, applyTheme } from "../../stores/settings.js";
import StarRating from "../StarRating.vue";

const themeEntries = computed(() => Object.entries(themeOptions));

function previewTheme(name) {
  const saved = settings.theme;
  settings.theme = name;
  applyTheme();
  setTimeout(() => (settings.theme = saved), 2200);
}

function resetTheme() {
  setTheme("tropical");
}
</script>

<template>
  <section class="admin-card customize">
    <h2 class="admin-card__title">Control de Personalización</h2>
    <p class="admin-card__subtitle">
      Los cambios se guardan automáticamente y se aplican en vivo sobre la landing. Usá la vista previa para decidir sin riesgo.
    </p>

    <div class="customize__grid">
      <div class="customize__block">
        <div class="customize__block-head">
          <Palette :size="18" aria-hidden="true" />
          <h3>Tema de color</h3>
        </div>

        <div class="customize__options">
          <label v-for="[key, theme] in themeEntries" :key="key" class="theme-option">
            <input v-model="settings.theme" type="radio" name="theme" :value="key" @change="setTheme(key)" />
            <span class="theme-option__card">
              <span class="theme-option__swatches">
                <i :style="{ background: theme.green }"></i>
                <i :style="{ background: theme.greenBright }"></i>
                <i :style="{ background: theme.gold }"></i>
              </span>
              <span class="theme-option__label">{{ theme.label }}</span>
            </span>
          </label>
        </div>

        <button class="btn btn--ghost btn--sm" type="button" @click="resetTheme">
          <RotateCcw :size="14" aria-hidden="true" />
          Restaurar tema original
        </button>

        <div class="customize__preview">
          <p class="customize__preview-title">Vista previa en vivo</p>
          <div class="preview-card">
            <span class="preview-card__badge is-open"><i></i> Abierto ahora</span>
            <p class="preview-card__title">Cóctel de la casa</p>
            <StarRating :value="4.4" :size="14" />
            <div class="preview-card__actions">
              <span class="preview-card__btn preview-card__btn--primary">Reservar</span>
              <span class="preview-card__btn preview-card__btn--outline">Ver en RA</span>
            </div>
          </div>
        </div>

        <p class="customize__note">
          Tip: el tema <strong>Dorado Pacifico</strong> se ve muy bien en temporada de Navidad; el
          <strong>Coral Sunset</strong> acompaña noches de verano.
        </p>
      </div>

      <div class="customize__block">
        <div class="customize__block-head">
          <Megaphone :size="18" aria-hidden="true" />
          <h3>Banner de temporada</h3>
        </div>

        <label class="check">
          <input v-model="settings.banner.enabled" type="checkbox" @change="setBanner({ enabled: settings.banner.enabled })" />
          <span>Mostrar banner promocional en la landing</span>
        </label>

        <label class="field">
          <span>Texto del banner</span>
          <input
            v-model="settings.banner.text"
            type="text"
            maxlength="90"
            placeholder="¡Noches de maridaje todos los viernes!"
            @change="setBanner({ text: settings.banner.text })"
          />
          <small class="field__hint">{{ settings.banner.text.length }}/90 caracteres</small>
        </label>

        <div v-if="settings.banner.enabled" class="banner-preview" aria-hidden="true">
          {{ settings.banner.text }}
        </div>

        <p class="customize__note">
          El banner aparece fijo bajo el encabezado, ideal para promos de fin de semana, menús especiales o eventos.
        </p>

        <RouterLink class="customize__link" to="/">
          <ExternalLink :size="14" aria-hidden="true" />
          Ver cambios en la landing
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.customize {
  max-width: 980px;
}

.customize__grid {
  display: grid;
  gap: 26px;
  margin-top: 22px;
}

@media (min-width: 900px) {
  .customize__grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.customize__block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-md);
  background: var(--bg-panel-2);
  border: 1px solid rgba(245, 239, 224, 0.08);
}

.customize__block-head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gold-light);
}

.customize__block-head h3 {
  font-size: 1.05rem;
  color: var(--cream);
}

.customize__options {
  display: grid;
  gap: 10px;
}

.theme-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.theme-option__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.12);
  background: var(--bg-panel);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.theme-option:hover .theme-option__card {
  border-color: var(--muted);
}

.theme-option input:checked + .theme-option__card {
  border-color: var(--gold);
  box-shadow: 0 0 0 1px var(--gold) inset;
}

.theme-option__swatches {
  display: flex;
  gap: 5px;
}

.theme-option__swatches i {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.theme-option__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sand);
}

.btn--sm {
  min-height: 38px;
  padding: 7px 14px;
  font-size: 0.8rem;
  align-self: flex-start;
}

.customize__preview-title {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}

.preview-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: linear-gradient(160deg, var(--bg-panel-2), #0e1a14);
  border: 1px solid rgba(245, 239, 224, 0.1);
}

.preview-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(46, 158, 91, 0.14);
  color: var(--green-bright);
  border: 1px solid rgba(46, 158, 91, 0.35);
}

.preview-card__badge i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green-bright);
}

.preview-card__title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--cream);
}

.preview-card__actions {
  display: flex;
  gap: 8px;
}

.preview-card__btn {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.preview-card__btn--primary {
  background: linear-gradient(135deg, var(--green), var(--green-bright));
  color: #fff;
}

.preview-card__btn--outline {
  border: 1px solid var(--gold);
  color: var(--gold-light);
}

.customize__note {
  font-size: 0.78rem;
  color: var(--muted);
}

.check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--sand);
  cursor: pointer;
}

.check input {
  width: 18px;
  height: 18px;
  accent-color: var(--green);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sand);
}

.field input {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.16);
  background: var(--bg-panel);
  color: var(--cream);
  font: inherit;
  font-weight: 400;
  outline: none;
}

.field input:focus {
  border-color: var(--gold);
}

.field__hint {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.72rem;
}

.banner-preview {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--green), #12301f 40%, var(--green));
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.customize__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>