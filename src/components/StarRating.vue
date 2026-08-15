<script setup>
import { computed } from "vue";

const props = defineProps({
  value: { type: Number, required: true },
  size: { type: Number, default: 18 },
});

const pct = computed(() => Math.round((props.value / 5) * 100));
</script>

<template>
  <span
    class="stars"
    role="img"
    :aria-label="`Calificación ${value} de 5 estrellas`"
  >
    <span class="stars__bg" aria-hidden="true">
      <svg v-for="i in 5" :key="i" :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.26 6.6.72-4.9 4.55 1.32 6.47L12 16.77 6.08 20l1.32-6.47L2.5 8.98l6.6-.72L12 2z" />
      </svg>
    </span>
    <span class="stars__fill" :style="{ width: pct + '%' }" aria-hidden="true">
      <svg v-for="i in 5" :key="i" :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.26 6.6.72-4.9 4.55 1.32 6.47L12 16.77 6.08 20l1.32-6.47L2.5 8.98l6.6-.72L12 2z" />
      </svg>
    </span>
  </span>
</template>

<style scoped>
.stars {
  position: relative;
  display: inline-flex;
  color: rgba(245, 239, 224, 0.22);
  line-height: 0;
}

.stars__bg {
  display: inline-flex;
  gap: 2px;
}

.stars__fill {
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: inline-flex;
  gap: 2px;
  color: var(--gold);
  white-space: nowrap;
}
</style>