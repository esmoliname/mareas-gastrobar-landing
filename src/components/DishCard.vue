<script setup>
import { computed } from "vue";
import { Box, Flame } from "lucide-vue-next";
import { formatColones } from "../utils/format.js";

const props = defineProps({
  item: { type: Object, required: true },
});

defineEmits(["open-ar"]);

const imageAlt = computed(() => `${props.item.name} — Mareas Gastrobar Tropical`);
</script>

<template>
  <article class="dish">
    <div class="dish__media">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="imageAlt"
        class="dish__img"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="dish__fallback" aria-hidden="true">
        <Box :size="30" />
      </div>
      <span v-if="item.popular" class="dish__badge">
        <Flame :size="13" aria-hidden="true" />
        Popular
      </span>
      <span v-if="!item.available" class="dish__badge dish__badge--soldout">Agotado</span>
    </div>

    <div class="dish__body">
      <div class="dish__row">
        <span class="dish__category">{{ item.category }}</span>
        <span class="dish__price">{{ formatColones(item.price) }}</span>
      </div>
      <h3 class="dish__name">{{ item.name }}</h3>
      <p class="dish__desc">{{ item.description }}</p>
      <button class="btn btn--outline dish__ar" type="button" @click="$emit('open-ar', item)">
        <Box :size="16" aria-hidden="true" />
        Ver en RA
      </button>
    </div>
  </article>
</template>

<style scoped>
.dish {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.08);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.dish:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 162, 39, 0.4);
  box-shadow: var(--shadow-card);
}

.dish__media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-panel-2);
}

.dish__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.dish:hover .dish__img {
  transform: scale(1.05);
}

.dish__fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--muted);
}

.dish__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  color: #141003;
  font-size: 0.72rem;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.dish__badge--soldout {
  background: rgba(11, 18, 16, 0.85);
  color: var(--muted);
  border: 1px solid rgba(245, 239, 224, 0.2);
}

.dish__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  flex: 1;
}

.dish__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.dish__category {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--green-bright);
}

.dish__price {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gold-light);
  white-space: nowrap;
}

.dish__name {
  font-size: 1.15rem;
}

.dish__desc {
  color: var(--muted);
  font-size: 0.88rem;
  flex: 1;
}

.dish__ar {
  margin-top: 6px;
  min-height: 42px;
  font-size: 0.85rem;
}
</style>