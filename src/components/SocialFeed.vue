<script setup>
import { site } from "../data/site.js";

const posts = [
  { id: 1, url: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80", alt: "Mariscos del día en Mareas", label: "Mariscos del día", likes: 482 },
  { id: 2, url: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&q=80", alt: "Antojos de la casa", label: "Antojos", likes: 317 },
  { id: 3, url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80", alt: "Cóctel tropical en Mareas", label: "Cóctel de la casa", likes: 521 },
  { id: 4, url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80", alt: "Ambiente nocturno del bar", label: "Noches de Mareas", likes: 264 },
  { id: 5, url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", alt: "Pizza recién salida del horno", label: "Pizza al horno", likes: 388 },
  { id: 6, url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", alt: "Brindis en Mareas", label: "Cheers", likes: 455 },
];

const instagramLink = `${site.instagram}/?hl=es`;
</script>

<template>
  <section id="galeria" class="section social" aria-labelledby="social-title">
    <div class="container">
      <header class="social__head">
        <span class="eyebrow">Instagram</span>
        <h2 id="social-title">Síguenos en Instagram</h2>
        <p class="social__tagline">
          La vida en Mareas, post a post. Etiquetanos en tus fotos con
          <a :href="instagramLink" target="_blank" rel="noopener noreferrer" class="social__handle">{{ site.instagramHandle }}</a>.
        </p>
      </header>

      <ul class="social__grid" aria-label="Publicaciones recientes de Instagram">
        <li v-for="post in posts" :key="post.id">
          <a
            :href="instagramLink"
            target="_blank"
            rel="noopener noreferrer"
            class="social__item"
            :aria-label="`Ver ${post.alt} en Instagram`"
          >
            <img :src="post.url" :alt="post.alt" loading="lazy" decoding="async" class="social__img" />
            <span class="social__overlay">
              <span class="social__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                  <circle cx="12" cy="12" r="4"></circle>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
                </svg>
              </span>
              <span class="social__likes">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                </svg>
                {{ post.likes }}
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

.social__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.social__item:hover .social__img,
.social__item:focus-visible .social__img {
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

.social__likes {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
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
  .social__img {
    transition: none;
  }
}
</style>