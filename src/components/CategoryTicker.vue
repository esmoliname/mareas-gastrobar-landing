<script setup>
import { site } from "../data/site.js";

const items = [...site.highlights, ...site.highlights];
</script>

<template>
  <div class="ticker" aria-hidden="true">
    <div class="ticker__track">
      <span v-for="(item, i) in items" :key="i" class="ticker__item">
        {{ item.emoji }} {{ item.title }}
        <span class="ticker__dot">✦</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ticker {
  overflow: hidden;
  border-block: 1px solid rgba(201, 162, 39, 0.25);
  background: var(--bg-panel);
  padding-block: 12px;
}

.ticker__track {
  display: flex;
  gap: 28px;
  width: max-content;
  animation: ticker-scroll 26s linear infinite;
}

.ticker__item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--sand);
}

.ticker__dot {
  color: var(--gold);
  font-style: normal;
}

@keyframes ticker-scroll {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ticker__track {
    animation: none;
    flex-wrap: wrap;
    width: auto;
  }
}
</style>