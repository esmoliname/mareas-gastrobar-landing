<script setup>
import { site } from "../data/site.js";
import StarRating from "./StarRating.vue";
</script>

<template>
  <section id="opiniones" class="section social-proof" aria-labelledby="opiniones-title">
    <div class="container">
      <header class="social-proof__head">
        <span class="eyebrow">Opiniones reales</span>
        <h2 id="opiniones-title">La gente vuelve, y lo dice</h2>
      </header>

      <div class="social-proof__summary">
        <strong class="social-proof__score">{{ site.rating.value }}</strong>
        <div class="social-proof__stars">
          <StarRating :value="site.rating.value" :size="26" />
          <span class="social-proof__count">{{ site.rating.count }} opiniones en Google</span>
        </div>
      </div>

      <div class="social-proof__traffic" role="note">
        <span class="social-proof__traffic-dots" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i>
        </span>
        <p>
          <strong>Alta afluencia</strong> las noches de viernes y sábado — llegá temprano o reservá mesa por
          WhatsApp para asegurar lugar.
        </p>
      </div>

      <ul class="social-proof__list">
        <li v-for="t in site.testimonials" :key="t.name" class="social-proof__card">
          <blockquote>“{{ t.text }}”</blockquote>
          <footer>
            <span class="social-proof__avatar" aria-hidden="true">{{ t.name.charAt(0) }}</span>
            <cite>{{ t.name }}</cite>
          </footer>
        </li>
      </ul>

      <a class="btn btn--outline social-proof__cta" :href="site.googleReviews" target="_blank" rel="noopener noreferrer">
        Leer todas las opiniones en Google
      </a>
    </div>
  </section>
</template>

<style scoped>
.social-proof {
  background:
    radial-gradient(90% 70% at 85% 0%, rgba(46, 158, 91, 0.12) 0%, transparent 60%),
    var(--bg-panel);
  border-block: 1px solid rgba(245, 239, 224, 0.07);
}

.social-proof__head {
  margin-bottom: 28px;
}

.social-proof__summary {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 36px;
}

.social-proof__score {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 14vw, 5rem);
  line-height: 1;
  color: var(--gold-light);
}

.social-proof__stars {
  display: grid;
  gap: 8px;
}

.social-proof__count {
  font-size: 0.85rem;
  color: var(--muted);
}

.social-proof__traffic {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: rgba(201, 162, 39, 0.07);
  border: 1px solid rgba(201, 162, 39, 0.3);
  max-width: 560px;
}

.social-proof__traffic p {
  font-size: 0.85rem;
  color: var(--sand);
}

.social-proof__traffic strong {
  color: var(--gold-light);
}

.social-proof__traffic-dots {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.social-proof__traffic-dots i {
  width: 8px;
  height: 18px;
  border-radius: 4px;
  background: rgba(201, 162, 39, 0.25);
}

.social-proof__traffic-dots i:nth-child(-n + 4) {
  background: linear-gradient(180deg, var(--gold-light), var(--gold));
}

.social-proof__list {
  list-style: none;
  display: grid;
  gap: 14px;
  margin-bottom: 32px;
}

.social-proof__card {
  background: var(--bg-panel-2);
  border: 1px solid rgba(245, 239, 224, 0.08);
  border-radius: var(--radius-md);
  padding: 20px;
}

.social-proof__card blockquote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  margin-bottom: 14px;
}

.social-proof__card footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-proof__avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--green-bright));
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.social-proof__card cite {
  font-style: normal;
  font-weight: 600;
  font-size: 0.9rem;
}

.social-proof__cta {
  margin-top: 4px;
}

@media (min-width: 768px) {
  .social-proof__list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>