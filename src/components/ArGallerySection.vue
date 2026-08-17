<script setup>
import { computed } from "vue";
import { ScanLine } from "lucide-vue-next";
import { catalog } from "../stores/catalog.js";
import { arStore } from "../stores/ar.js";
import { formatColones } from "../utils/format.js";
import { photos } from "../data/images.js";
import SmartImage from "./SmartImage.vue";

// Galería 3D de la landing: muestra una selección de platillos con modelo 3D
// propio y abre el visor/RA directamente (arStore.open).
const FEATURED = ["pizza-pacifico", "ceviche-mareas", "mojito-fresa", "alitas-bbq", "camarones-ajillo", "cumple-mareas"];

const dishes = computed(() =>
  FEATURED.map((id) => catalog.items.find((i) => i.id === id)).filter(Boolean)
);

const fallbackPhoto = computed(() => photos.category.Pizzas);

function openAr(item) {
  arStore.openItem(item, "galeria");
}
</script>

<template>
  <section class="section ar-gallery" aria-labelledby="ar-gallery-title">
    <div class="container">
      <div class="ar-gallery__head">
        <p class="eyebrow">Realidad aumentada</p>
        <h2 id="ar-gallery-title">
          Mirá tu platillo <span class="gold-italic">en tu mesa</span>
        </h2>
        <p class="ar-gallery__intro u-muted">
          Cada platillo tiene su modelo 3D a escala real. Tocá <strong>Ver en RA</strong>,
          apuntá a tu mesa y decidí con los ojos antes de pedir.
        </p>
      </div>

      <div class="ar-gallery__grid">
        <article v-for="item in dishes" :key="item.id" class="ar-card">
          <div class="ar-card__media">
            <SmartImage
              :src="item.image"
              :fallback="fallbackPhoto"
              :alt="`${item.name} — modelo 3D`"
              ratio="1/1"
              class="ar-card__img"
            />
            <span class="ar-card__badge">
              <ScanLine :size="12" aria-hidden="true" />
              3D
            </span>
          </div>
          <div class="ar-card__body">
            <h3 class="ar-card__name">{{ item.name }}</h3>
            <p class="ar-card__desc">{{ item.description }}</p>
            <div class="ar-card__foot">
              <span class="ar-card__price">{{ formatColones(item.price) }}</span>
              <button class="btn btn--outline ar-card__btn" type="button" @click="openAr(item)">
                <ScanLine :size="15" aria-hidden="true" />
                Ver en RA
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ar-gallery__head {
  text-align: center;
  max-width: 560px;
  margin-inline: auto;
  margin-bottom: 32px;
}

.ar-gallery__head .eyebrow {
  justify-content: center;
}

.ar-gallery__head .eyebrow::before {
  display: none;
}

.ar-gallery__intro {
  margin-top: 10px;
}

.ar-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}

.ar-card {
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.08);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.ar-card:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 162, 39, 0.4);
  box-shadow: var(--shadow-card);
}

.ar-card__media {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--bg-panel-2);
}

.ar-card__img {
  position: absolute;
  inset: 0;
  height: 100%;
}

.ar-card__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(11, 18, 16, 0.82);
  border: 1px solid rgba(201, 162, 39, 0.45);
  color: var(--gold-light);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.ar-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.ar-card__name {
  font-size: 1.02rem;
}

.ar-card__desc {
  color: var(--muted);
  font-size: 0.82rem;
  flex: 1;
}

.ar-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.ar-card__price {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--gold-light);
  white-space: nowrap;
}

.ar-card__btn {
  min-height: 38px;
  font-size: 0.78rem;
  padding-inline: 12px;
}
</style>