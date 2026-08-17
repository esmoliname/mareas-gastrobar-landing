<script setup>
import { computed } from "vue";
import { Megaphone, ExternalLink } from "lucide-vue-next";
import { settings, setBanner } from "../../../stores/settings.js";

const MAX_BANNER = 90;

const bannerLength = computed(() => settings.banner.text.length);

function onTextChange(e) {
  setBanner({ text: String(e.target.value || "").slice(0, MAX_BANNER) });
}
</script>

<template>
  <div class="banner-settings">
    <div class="banner-settings__head">
      <Megaphone :size="18" aria-hidden="true" />
      <h3>Banner de temporada</h3>
    </div>

    <label class="adm-check">
      <input
        :checked="settings.banner.enabled"
        type="checkbox"
        @change="setBanner({ enabled: $event.target.checked })"
      />
      <span>Mostrar banner promocional en la landing</span>
    </label>

    <label class="adm-field">
      <span class="adm-field__label">Texto del banner</span>
      <input
        :value="settings.banner.text"
        type="text"
        maxlength="90"
        placeholder="¡Noches de maridaje todos los viernes!"
        @change="onTextChange"
      />
      <small class="adm-field__hint">{{ bannerLength }}/{{ MAX_BANNER }} caracteres</small>
    </label>

    <div v-if="settings.banner.enabled" class="banner-settings__preview" aria-hidden="true">
      {{ settings.banner.text }}
    </div>

    <p class="banner-settings__note">
      El banner aparece fijo bajo el encabezado, ideal para promos de fin de semana, menús especiales o eventos.
    </p>

    <RouterLink class="banner-settings__link" to="/">
      <ExternalLink :size="14" aria-hidden="true" />
      Ver cambios en la landing
    </RouterLink>
  </div>
</template>

<style scoped>
.banner-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner-settings__head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gold-light);
}

.banner-settings__head h3 {
  font-size: 1.05rem;
  color: var(--cream);
}

.banner-settings__preview {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--green), #12301f 40%, var(--green));
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.banner-settings__note {
  font-size: 0.78rem;
  color: var(--muted);
}

.banner-settings__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>