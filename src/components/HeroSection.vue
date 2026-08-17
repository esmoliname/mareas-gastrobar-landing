<script setup>
import { site, whatsappUrl } from "../data/site.js";
import WhatsappIcon from "./WhatsappIcon.vue";
import StarRating from "./StarRating.vue";
import { Clock, MapPin, Martini, ScanLine } from "lucide-vue-next";

defineProps({
  status: { type: Object, required: true },
  featuredDish: { type: Object, default: null },
});

defineEmits(["open-ar"]);
</script>

<template>
  <section id="top" class="hero">
    <div class="hero__bg" aria-hidden="true">
      <img
        class="hero__img"
        src="/photos/hero.jpg"
        alt=""
        fetchpriority="high"
        decoding="async"
      />
      <div class="hero__shade"></div>
      <div class="hero__sun"></div>
      <svg class="hero__palm" viewBox="0 0 96 176" aria-hidden="true">
        <path
          fill="currentColor"
          d="M46 176c-2-34 2-62 10-96-9 1-20-4-30-13 9 2 17 0 23-5-8-9-13-22-13-37 11 8 18 16 22 25 4-9 12-17 25-25-1 14-6 26-14 36 7 5 17 7 28 6-9 8-19 12-29 13 2 10 3 30 1 46h-9c-2-12-4-21-5-26-2 5-4 14-5 26h-4z"
        />
      </svg>
      <svg class="hero__palm hero__palm--far" viewBox="0 0 96 176" aria-hidden="true">
        <path
          fill="currentColor"
          d="M46 176c-2-34 2-62 10-96-9 1-20-4-30-13 9 2 17 0 23-5-8-9-13-22-13-37 11 8 18 16 22 25 4-9 12-17 25-25-1 14-6 26-14 36 7 5 17 7 28 6-9 8-19 12-29 13 2 10 3 30 1 46h-9c-2-12-4-21-5-26-2 5-4 14-5 26h-4z"
        />
      </svg>
    </div>

    <div class="container hero__content">
      <a class="hero__rating" :href="site.googleReviews" target="_blank" rel="noopener noreferrer">
        <StarRating :value="site.rating.value" :size="15" />
        <strong>{{ site.rating.value }}</strong>
        <span>· {{ site.rating.count }} opiniones en Google</span>
      </a>

      <div class="hero__status" :class="status.open ? 'is-open' : 'is-closed'" role="status">
        <span class="hero__status-dot" aria-hidden="true"></span>
        <span class="hero__status-label">{{ status.label }}</span>
        <span class="hero__status-note">{{ status.note }}</span>
      </div>

      <h1 class="hero__title">
        Mareas
        <span class="gold-italic">Gastrobar Tropical</span>
      </h1>

      <p class="hero__subtitle">{{ site.tagline }}</p>

      <div class="hero__actions">
        <a class="btn btn--primary" :href="whatsappUrl()" target="_blank" rel="noopener noreferrer">
          <WhatsappIcon :size="20" />
          Reservá tu mesa
        </a>
        <a class="btn btn--outline" href="#menu">Ver menú</a>
        <button
          v-if="featuredDish"
          class="btn btn--gold hero__ar-cta"
          type="button"
          @click="$emit('open-ar')"
        >
          <ScanLine :size="19" aria-hidden="true" />
          Probalo en 3D
        </button>
      </div>

      <dl class="hero__meta">
        <div>
          <dt class="u-muted"><span class="hero__meta-icon" aria-hidden="true"><MapPin :size="13" /></span> Ubicación</dt>
          <dd>Barrio Lourdes, Ciudad Quesada</dd>
        </div>
        <div>
          <dt class="u-muted"><span class="hero__meta-icon" aria-hidden="true"><Clock :size="13" /></span> Hoy</dt>
          <dd>{{ status.open ? "Abierto" : "Cerrado" }} · {{ status.note }}</dd>
        </div>
        <div>
          <dt class="u-muted"><span class="hero__meta-icon" aria-hidden="true"><Martini :size="13" /></span> Vibra</dt>
          <dd>Ambiente de playa</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: calc(100svh - var(--header-h));
  padding-block: 56px 48px;
  background: linear-gradient(170deg, #14201a 0%, #0e1a14 55%, #0b1210 100%);
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  opacity: 0.38;
  animation: hero-zoom 24s ease-in-out infinite alternate;
}

@keyframes hero-zoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

.hero__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(11, 18, 16, 0.62) 0%, rgba(11, 18, 16, 0.28) 40%, rgba(11, 18, 16, 0.9) 100%),
    radial-gradient(120% 80% at 20% 15%, rgba(46, 158, 91, 0.18) 0%, transparent 55%);
}

.hero__sun {
  position: absolute;
  width: 190px;
  height: 190px;
  top: 14%;
  right: -40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 178, 60, 0.75) 0%, rgba(217, 178, 60, 0.18) 45%, transparent 70%);
}

.hero__palm {
  position: absolute;
  width: 84px;
  bottom: 8%;
  left: -14px;
  opacity: 0.5;
  transform: rotate(-14deg);
  color: #0c1511;
  filter: drop-shadow(0 0 18px rgba(0, 0, 0, 0.45));
}

.hero__palm--far {
  width: 52px;
  bottom: 20%;
  left: 22%;
  opacity: 0.25;
}

.hero__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.hero__rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(245, 239, 224, 0.06);
  border: 1px solid rgba(245, 239, 224, 0.12);
  color: var(--cream);
  font-size: 0.8rem;
}

.hero__rating strong {
  color: var(--gold-light);
}

.hero__rating:hover {
  border-color: var(--gold);
}

.hero__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(46, 158, 91, 0.12);
  border: 1px solid rgba(46, 158, 91, 0.45);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--green-bright);
}

.hero__status.is-closed {
  background: rgba(159, 176, 166, 0.08);
  border-color: rgba(159, 176, 166, 0.35);
  color: var(--muted);
}

.hero__status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--green-bright);
  box-shadow: 0 0 0 3px rgba(46, 158, 91, 0.25);
  animation: status-pulse 2s ease-out infinite;
}

.hero__status.is-closed .hero__status-dot {
  background: var(--muted);
  box-shadow: none;
  animation: none;
}

.hero__status-note {
  font-weight: 500;
  opacity: 0.85;
}

@keyframes status-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(46, 158, 91, 0.4);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(46, 158, 91, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 158, 91, 0);
  }
}

.hero__title {
  max-width: 11ch;
}

.hero__subtitle {
  max-width: 30ch;
  color: var(--sand);
  font-size: 1.05rem;
}

.hero__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  max-width: 420px;
}

.hero__meta {
  display: grid;
  gap: 10px;
  margin-top: 22px;
  width: 100%;
  max-width: 420px;
  padding: 16px;
  border: 1px solid rgba(245, 239, 224, 0.1);
  border-radius: var(--radius-md);
  background: rgba(14, 26, 20, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  font-size: 0.82rem;
}

.hero__meta dt {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero__meta-icon {
  display: inline-flex;
  color: var(--gold-light);
}

.hero__meta dd {
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hero__img {
    animation: none;
  }
}

@media (min-width: 768px) {
  .hero {
    align-items: center;
    padding-block: 80px;
  }

  .hero__actions {
    flex-direction: row;
    align-items: center;
  }

  .hero__meta {
    grid-template-columns: repeat(3, 1fr);
  }

  .hero__sun {
    width: 320px;
    height: 320px;
    right: -60px;
  }

  .hero__palm {
    width: 128px;
    left: 4%;
  }

  .hero__palm--far {
    left: 30%;
  }
}
</style>