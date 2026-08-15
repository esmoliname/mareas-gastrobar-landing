<script setup>
import { whatsappUrl } from "../data/site.js";
import WhatsappIcon from "./WhatsappIcon.vue";
</script>

<template>
  <a
    class="wa-fab"
    :href="whatsappUrl()"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Reservar por WhatsApp — abre conversación con Mareas"
  >
    <WhatsappIcon :size="28" />
  </a>
</template>

<style scoped>
.wa-fab {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 60;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--wa-green);
  color: #062a14;
  box-shadow: 0 10px 28px rgba(37, 211, 102, 0.45);
  animation: fab-pulse 2.6s ease-out infinite;
  transition: transform 0.15s ease;
}

.wa-fab:hover {
  transform: scale(1.06);
  color: #062a14;
}

@keyframes fab-pulse {
  0% {
    box-shadow: 0 10px 28px rgba(37, 211, 102, 0.45), 0 0 0 0 rgba(37, 211, 102, 0.35);
  }
  70% {
    box-shadow: 0 10px 28px rgba(37, 211, 102, 0.45), 0 0 0 16px rgba(37, 211, 102, 0);
  }
  100% {
    box-shadow: 0 10px 28px rgba(37, 211, 102, 0.45), 0 0 0 0 rgba(37, 211, 102, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wa-fab {
    animation: none;
  }
}
</style>