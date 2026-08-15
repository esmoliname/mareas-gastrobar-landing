<script setup>
import { site } from "../data/site.js";
import PlaceholderMedia from "./PlaceholderMedia.vue";
</script>

<template>
  <section id="destacados" class="section" aria-labelledby="destacados-title">
    <div class="container">
      <header class="highlights__head">
        <span class="eyebrow">Los favoritos de la casa</span>
        <h2 id="destacados-title">Todo lo que buscás para hoy</h2>
        <p class="u-muted">Los cinco motivos por los que la gente vuelve: de la mesa al bar, sin prisa.</p>
      </header>

      <ul class="highlights__grid" aria-label="Categorías destacadas">
        <li v-for="(item, i) in site.highlights" :key="item.id" class="highlights__card">
          <PlaceholderMedia
            :ratio="i % 2 === 0 ? '4/5' : '1/1'"
            :tone="i % 3 === 0 ? 'sunset' : i % 3 === 1 ? 'food' : 'gold'"
            :emoji="item.emoji"
            :label="item.title"
          />
          <div class="highlights__body">
            <h3>{{ item.title }}</h3>
            <p class="u-muted">{{ item.desc }}</p>
            <a :href="site.instagram" target="_blank" rel="noopener noreferrer" class="highlights__link">
              Ver en Instagram →
            </a>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.highlights__head {
  max-width: 46ch;
  margin-bottom: 32px;
}

.highlights__head h2 {
  margin-bottom: 10px;
}

.highlights__grid {
  list-style: none;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 12px;
  margin-inline: -20px;
  padding-inline: 20px;
  scrollbar-width: thin;
}

.highlights__card {
  flex: 0 0 74%;
  scroll-snap-align: start;
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.08);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.highlights__body {
  padding: 16px;
  display: grid;
  gap: 8px;
}

.highlights__body p {
  font-size: 0.88rem;
}

.highlights__link {
  font-size: 0.82rem;
  font-weight: 600;
}

@media (min-width: 768px) {
  .highlights__grid {
    margin-inline: 0;
    padding-inline: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .highlights__grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>