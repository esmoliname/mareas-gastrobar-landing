<script setup>
defineProps({
  ratio: { type: String, default: "4/3" },
  tone: { type: String, default: "sunset" },
  emoji: { type: String, default: "🌴" },
  label: { type: String, default: "Mareas" },
});
</script>

<template>
  <div
    class="placeholder"
    :class="`placeholder--${tone}`"
    :style="{ aspectRatio: ratio }"
    role="img"
    :aria-label="`Placeholder visual: ${label}`"
  >
    <span class="placeholder__inner">
      <span class="placeholder__emoji" aria-hidden="true">{{ emoji }}</span>
      <span class="placeholder__label">{{ label }}</span>
    </span>
  </div>
</template>