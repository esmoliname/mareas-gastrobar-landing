<script setup>
import { computed } from "vue";
import { Palette, RotateCcw } from "lucide-vue-next";
import { settings, themeOptions, setTheme } from "../../../stores/settings.js";
import StarRating from "../../StarRating.vue";

const themeEntries = computed(() => Object.entries(themeOptions));

function resetTheme() {
  setTheme("tropical");
}
</script>

<template>
  <div class="theme-settings">
    <div class="adm-field__label theme-settings__head">
      <Palette :size="18" aria-hidden="true" />
      <span>Tema de color</span>
    </div>

    <div class="theme-settings__options">
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

    <button class="btn btn--ghost adm-btn--sm" type="button" @click="resetTheme">
      <RotateCcw :size="14" aria-hidden="true" />
      Restaurar tema original
    </button>

    <div class="theme-settings__preview">
      <p class="theme-settings__preview-title">Vista previa en vivo</p>
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

    <p class="theme-settings__note">
      Tip: el tema <strong>Dorado Pacifico</strong> se ve muy bien en temporada de Navidad; el
      <strong>Coral Sunset</strong> acompaña noches de verano.
    </p>
  </div>
</template>

<style scoped>
.theme-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-settings__head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gold-light);
  font-size: 1.05rem;
}

.theme-settings__options {
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

.theme-settings__preview-title {
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

.theme-settings__note {
  font-size: 0.78rem;
  color: var(--muted);
}
</style>