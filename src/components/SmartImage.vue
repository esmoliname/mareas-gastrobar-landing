<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  src: { type: String, default: "" },
  fallback: { type: String, default: "" },
  alt: { type: String, default: "" },
  ratio: { type: String, default: "4/3" },
});

const broken = ref(false);

watch(
  () => props.src,
  () => {
    broken.value = false;
  }
);

const shown = computed(() => (broken.value ? props.fallback : props.src));
</script>

<template>
  <div class="smart-img" :style="{ aspectRatio: ratio }">
    <img
      v-if="shown"
      :src="shown"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="smart-img__el"
      @error="broken = true"
    />
    <div v-else class="smart-img__empty" aria-hidden="true">
      <span class="smart-img__mark">Mareas</span>
    </div>
  </div>
</template>

<style scoped>
.smart-img {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--bg-panel-2);
}

.smart-img__el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.smart-img__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(80% 60% at 50% 40%, rgba(46, 158, 91, 0.2) 0%, transparent 70%),
    linear-gradient(145deg, var(--bg-panel-2) 0%, #17301f 100%);
}

.smart-img__mark {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.1rem;
  letter-spacing: 0.06em;
  color: rgba(245, 239, 224, 0.55);
}
</style>