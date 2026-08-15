<script setup>
import { site } from "../data/site.js";
import PlaceholderMedia from "./PlaceholderMedia.vue";

const galleryItems = [
  { emoji: "🍹", label: "Cócteles", tone: "food" },
  { emoji: "🌮", label: "Antojos", tone: "food" },
  { emoji: "🎉", label: "Noche de eventos", tone: "sunset" },
  { emoji: "🍕", label: "Pizza", tone: "gold" },
  { emoji: "🥂", label: "Cheers", tone: "sunset" },
  { emoji: "🌴", label: "El ambiente", tone: "food" },
];
</script>

<template>
  <section id="galeria" class="section gallery" aria-labelledby="galeria-title">
    <div class="container">
      <header class="gallery__head">
        <span class="eyebrow">Galería</span>
        <h2 id="galeria-title">La vida en Mareas</h2>
        <a class="gallery__follow" :href="site.instagram" target="_blank" rel="noopener noreferrer">
          Seguinos en Instagram · {{ site.instagramHandle }}
        </a>
      </header>

      <ul class="gallery__grid" aria-label="Galería de fotos de Instagram">
        <li v-for="(item, i) in galleryItems" :key="i">
          <a :href="site.instagram" target="_blank" rel="noopener noreferrer" class="gallery__item">
            <PlaceholderMedia ratio="4/5" :tone="item.tone" :emoji="item.emoji" :label="item.label" />
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.gallery__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 28px;
}

.gallery__follow {
  margin-top: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.gallery__grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.gallery__item {
  display: block;
  border-radius: var(--radius-md);
  overflow: hidden;
  outline-offset: 3px;
}

.gallery__item:hover .placeholder {
  transform: scale(1.03);
}

.gallery__item .placeholder {
  transition: transform 0.3s ease;
}

@media (min-width: 768px) {
  .gallery__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}
</style>