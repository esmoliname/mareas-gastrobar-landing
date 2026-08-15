<script setup>
import { site, whatsappUrl } from "../data/site.js";
import WhatsappIcon from "./WhatsappIcon.vue";

defineProps({
  status: { type: Object, required: true },
});
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="site-header__logo" href="#top" aria-label="Mareas Gastrobar Tropical — inicio">
        <span class="site-header__name">Mareas</span>
        <span class="site-header__tag">Gastrobar Tropical</span>
      </a>

      <nav class="site-header__nav" aria-label="Navegación principal">
        <a href="#menu">Menú</a>
        <a href="#destacados">Destacados</a>
        <a href="#opiniones">Opiniones</a>
        <a href="#galeria">Galería</a>
        <a href="#ubicacion">Visítanos</a>
      </nav>

      <div class="site-header__actions">
        <span class="status-badge" :class="status.open ? 'is-open' : 'is-closed'">
          <span class="status-badge__dot" aria-hidden="true"></span>
          <span class="status-badge__label">{{ status.open ? "Abierto ahora" : "Cerrado" }}</span>
          <span class="status-badge__note">{{ status.note }}</span>
        </span>
        <a class="site-header__phone" :href="`tel:${site.phoneTel}`" aria-label="Llamar a Mareas">
          {{ site.phoneDisplay }}
        </a>
        <a
          class="site-header__wa"
          :href="whatsappUrl()"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir a Mareas por WhatsApp"
        >
          <WhatsappIcon :size="18" />
          <span>Reservar</span>
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--header-h);
  background: rgba(11, 18, 16, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(245, 239, 224, 0.08);
}

.site-header__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
}

.site-header__logo {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  margin-right: auto;
}

.site-header__name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--cream);
}

.site-header__tag {
  font-size: 0.56rem;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--gold);
}

.site-header__nav {
  display: none;
}

.site-header__phone {
  display: none;
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.site-header__wa {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--wa-green);
  color: #062a14;
  font-weight: 700;
  font-size: 0.85rem;
}

.site-header__wa:hover {
  background: #2fdf77;
  color: #062a14;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(245, 239, 224, 0.06);
  border: 1px solid rgba(245, 239, 224, 0.1);
}

.status-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-bright);
  box-shadow: 0 0 0 3px rgba(46, 158, 91, 0.2);
}

.is-closed .status-badge__dot {
  background: var(--muted);
  box-shadow: none;
}

.status-badge__note {
  color: var(--muted);
}

@media (min-width: 768px) {
  .site-header__nav {
    display: flex;
    gap: 22px;
    margin-left: auto;
  }

  .site-header__nav a {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--sand);
  }

  .site-header__nav a:hover {
    color: var(--gold-light);
  }

  .site-header__phone {
    display: inline-flex;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--cream);
  }
}

@media (min-width: 1024px) {
  .site-header__inner {
    gap: 28px;
  }

  .status-badge__note {
    display: inline;
  }
}
</style>