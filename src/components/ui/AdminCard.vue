<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
});
</script>

<template>
  <section class="adm-card">
    <div class="adm-card__head">
      <div>
        <h2 class="adm-card__title">{{ title }}</h2>
        <p v-if="subtitle" class="adm-card__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="adm-card__actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>