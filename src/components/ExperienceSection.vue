<script setup>
import { Martini, Palmtree, PartyPopper, Pizza } from "lucide-vue-next";
import { whatsappUrl } from "../data/site.js";
import { photos } from "../data/images.js";
import SmartImage from "./SmartImage.vue";
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
          <li><Palmtree :size="17" aria-hidden="true" /> Terraza con ambiente de playa, relajado y sin prisa</li>
          <li><Martini :size="17" aria-hidden="true" /> Cócteles de autor para quedar un rato más</li>
          <li><Pizza :size="17" aria-hidden="true" /> Pizza y antojos para compartir mesa y charla</li>
          <li><PartyPopper :size="17" aria-hidden="true" /> Noches de eventos, música y buena vibra</li>
        </ul>
        <a class="btn btn--primary" :href="whatsappUrl()" target="_blank" rel="noopener noreferrer">
          <WhatsappIcon :size="20" />
          Reservá tu experiencia
        </a>
      </div>

      <div class="experience__media" aria-label="Galería de ambiente">
        <SmartImage :src="photos.experience.sunset" alt="Atardecer en Mareas" ratio="16/9" class="experience__shot experience__shot--wide" />
        <SmartImage :src="photos.experience.cocktail" alt="Cóctel de la casa" ratio="1/1" class="experience__shot" />
        <SmartImage :src="photos.experience.pizza" alt="Pizza al horno" ratio="1/1" class="experience__shot" />
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

.experience__list li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.experience__list svg {
  color: var(--gold-light);
  flex-shrink: 0;
}

.experience__media {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.experience__media .experience__shot:first-child {
  grid-column: 1 / -1;
}

.experience__media .smart-img {
  border-radius: var(--radius-md);
}

@media (min-width: 1024px) {
  .experience__grid {
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 72px;
  }
}
</style>