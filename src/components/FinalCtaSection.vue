<script setup>
import { site, whatsappUrl } from "../data/site.js";
import WhatsappIcon from "./WhatsappIcon.vue";
</script>

<template>
  <section class="final-cta" aria-labelledby="final-cta-title">
    <div class="container final-cta__inner">
      <h2 id="final-cta-title">
        ¿Cuándo <span class="gold-italic">venís?</span>
      </h2>
      <p class="final-cta__text">
        La mesa ya está puesta. Solo falta que elijas con quién compartir la escapada.
      </p>
      <a class="btn btn--wa btn--block final-cta__btn" :href="whatsappUrl()" target="_blank" rel="noopener noreferrer">
        <WhatsappIcon :size="22" />
        Reservar por WhatsApp
      </a>
      <a class="final-cta__phone" :href="`tel:${site.phoneTel}`">
        o llamá directo: {{ site.phoneDisplay }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.final-cta {
  position: relative;
  padding-block: 72px;
  background:
    radial-gradient(120% 100% at 80% 0%, rgba(232, 122, 93, 0.28) 0%, transparent 55%),
    radial-gradient(90% 80% at 10% 100%, rgba(46, 158, 91, 0.3) 0%, transparent 60%),
    var(--bg-panel);
  border-top: 1px solid rgba(245, 239, 224, 0.07);
  text-align: center;
}

.final-cta__inner {
  display: grid;
  gap: 16px;
  justify-items: center;
}

.final-cta__text {
  max-width: 36ch;
  color: var(--sand);
}

.final-cta__btn {
  max-width: 420px;
}

.final-cta__phone {
  font-size: 0.9rem;
  color: var(--muted);
}

.final-cta__phone:hover {
  color: var(--gold-light);
}
</style>