<script setup>
import { site } from "../data/site.js";
import { photos } from "../data/images.js";
import SmartImage from "./SmartImage.vue";

const posts = photos.social;

const instagramLink = `${site.instagram}/?hl=es`;
</script>

<template>
  <section id="galeria" class="section social" aria-labelledby="social-title">
    <div class="container">
      <header class="social__head">
        <span class="eyebrow">Instagram</span>
        <h2 id="social-title">Lo que pasa en Mareas</h2>
        <p class="social__tagline">
          Etiquetanos con
          <a :href="instagramLink" target="_blank" rel="noopener noreferrer" class="social__handle">{{ site.instagramHandle }}</a>
          y aparecé en esta galería.
        </p>
      </header>

      <ul class="social__grid" aria-label="Publicaciones recientes de Instagram">
        <li v-for="post in posts" :key="post.url">
          <a
            :href="instagramLink"
            target="_blank"
            rel="noopener noreferrer"
            class="social__item"
            :aria-label="`Ver ${post.alt} en Instagram`"
          >
            <SmartImage :src="post.url" :alt="post.alt" ratio="4/5" />
            <span class="social__overlay">
              <span class="social__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                  <circle cx="12" cy="12" r="4"></circle>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
                </svg>
              </span>
              <span class="social__label">{{ post.label }}</span>
            </span>
          </a>
        </li>
      </ul>

      <div class="social__ctas">
        <a
          class="btn social__cta social__cta--instagram"
          :href="instagramLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
          </svg>
          Seguir en Instagram
        </a>
        <a class="btn btn--outline" :href="site.facebook" target="_blank" rel="noopener noreferrer">
          Visitar Facebook
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.social__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 28px;
}

.social__tagline {
  max-width: 46ch;
  margin: 4px 0 0;
  color: var(--sand);
  font-size: 0.95rem;
}

.social__handle {
  color: var(--gold-light);
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid rgba(201, 162, 39, 0.4);
}

.social__handle:hover {
  border-color: var(--gold);
}

.social__grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.social__item {
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  overflow: hidden;
  outline-offset: 3px;
  background: #0d1712;
}

.social__item .smart-img {
  border-radius: 0;
}

.social__item :deep(.smart-img__el) {
  transform: scale(1.01);
  transition: transform 0.45s ease;
}

.social__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(180deg, rgba(224, 61, 122, 0.12) 0%, rgba(11, 18, 16, 0.88) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
  font-weight: 700;
}

.social__item:hover :deep(.smart-img__el),
.social__item:focus-visible :deep(.smart-img__el) {
  transform: scale(1.06);
}

.social__item:hover .social__overlay,
.social__item:focus-visible .social__overlay {
  opacity: 1;
}

.social__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f9ce34, #ee2a7b 50%, #6228d7);
}

.social__label {
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.85;
}

.social__ctas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 26px;
  max-width: 420px;
}

.social__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.social__cta--instagram {
  color: #fff;
  background: linear-gradient(45deg, #f9ce34, #ee2a7b 50%, #6228d7);
  border-color: transparent;
  box-shadow: 0 6px 18px rgba(238, 42, 123, 0.35);
}

@media (min-width: 768px) {
  .social__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .social__ctas {
    flex-direction: row;
  }
}

@media (prefers-reduced-motion: reduce) {
  .social__item :deep(.smart-img__el) {
    transition: none;
  }
}
</style>