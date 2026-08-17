<script setup>
import AdminCard from "../ui/AdminCard.vue";
import ThemeSettings from "./customize/ThemeSettings.vue";
import BannerSettings from "./customize/BannerSettings.vue";
</script>

<template>
  <AdminCard
    title="Control de Personalización"
    subtitle="Los cambios se guardan automáticamente y se aplican en vivo sobre la landing. Usá la vista previa para decidir sin riesgo."
  >
    <div class="customize__grid">
      <div class="customize__block">
        <ThemeSettings />
      </div>
      <div class="customize__block">
        <BannerSettings />
      </div>
    </div>
  </AdminCard>
</template>

<style scoped>
.customize__grid {
  display: grid;
  gap: 26px;
}

@media (min-width: 900px) {
  .customize__grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.customize__block {
  padding: 20px;
  border-radius: var(--radius-md);
  background: var(--bg-panel-2);
  border: 1px solid rgba(245, 239, 224, 0.08);
}
</style>