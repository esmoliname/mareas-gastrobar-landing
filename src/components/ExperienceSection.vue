<script setup>
import { whatsappUrl } from "../data/site.js";
import PlaceholderMedia from "./PlaceholderMedia.vue";
import WhatsappIcon from "./WhatsappIcon.vue";
</script>

<template>
  <section class="section experience" aria-labelledby="experience-title">
    <div class="container experience__grid">
      <div class="experience__copy">
        <span class="eyebrow">La experiencia</span>
        <h2 id="experience-title">
          El mejor ambiente de playa <span class="gold-italic">en la ciudad</span>
        </h2>
        <p class="experience__lead">
          En Mareas el lujo es sentirse libre: sabores tropicales, cócteles con carácter y una
          vibra que baja el ritmo de todo.
        </p>
        <ul class="experience__list">
          <li>🌴 Terraza con ambiente de playa, relajado y sin prisa</li>
          <li>🍹 Cócteles de autor para quedar un rato más</li>
          <li>🍕 Pizza y antojos para compartir mesa y charla</li>
          <li>🎉 Noches de eventos, música y buena vibra</li>
        </ul>
        <a class="btn btn--primary" :href="whatsappUrl()" target="_blank" rel="noopener noreferrer">
          <WhatsappIcon :size="20" />
          Reservá tu experiencia
        </a>
      </div>

      <div class="experience__media" aria-label="Galería de ambiente">
        <PlaceholderMedia ratio="16/9" tone="sunset" emoji="🌅" label="Atardecer en Mareas" />
        <PlaceholderMedia ratio="1/1" tone="food" emoji="🍹" label="Cóctel de la casa" />
        <PlaceholderMedia ratio="1/1" tone="gold" emoji="🍕" label="Pizza al horno" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience__grid {
  display: grid;
  gap: 40px;
}

.experience__copy {
  display: grid;
  gap: 18px;
  align-content: start;
}

.experience__lead {
  color: var(--sand);
  font-size: 1.08rem;
  max-width: 42ch;
}

.experience__list {
  list-style: none;
  display: grid;
  gap: 10px;
  color: var(--cream);
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.experience__media {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.experience__media .placeholder:first-child {
  grid-column: 1 / -1;
}

@media (min-width: 1024px) {
  .experience__grid {
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 72px;
  }
}
</style>