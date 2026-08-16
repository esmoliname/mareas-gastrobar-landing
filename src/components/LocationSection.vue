<script setup>
import { computed } from "vue";
import { site, whatsappUrl } from "../data/site.js";
import WhatsappIcon from "./WhatsappIcon.vue";
import { MessageCircle, Phone } from "lucide-vue-next";

const props = defineProps({
  status: { type: Object, required: true },
});

const todayIndex = computed(() => new Date().getDay());
const todayName = computed(() => {
  const names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return names[todayIndex.value];
});
</script>

<template>
  <section id="ubicacion" class="section location" aria-labelledby="ubicacion-title">
    <div class="container">
      <header class="location__head">
        <span class="eyebrow">Ubicación y operación</span>
        <h2 id="ubicacion-title">Te esperamos en Barrio Lourdes</h2>
      </header>

      <div class="location__grid">
        <address class="location__card">
          <p class="location__address">
            <strong>{{ site.addressLine1 }}</strong><br />
            {{ site.addressLine2 }}
          </p>

          <div class="location__actions">
            <a class="btn btn--primary" :href="site.wazeLink" target="_blank" rel="noopener noreferrer">
              Cómo llegar con Waze
            </a>
            <a class="btn btn--ghost" :href="site.mapsLink" target="_blank" rel="noopener noreferrer">
              Abrir en Google Maps
            </a>
          </div>

          <div class="location__contact">
            <a :href="`tel:${site.phoneTel}`">
              <Phone :size="14" class="location__contact-icon" aria-hidden="true" />
              <strong>{{ site.phoneDisplay }}</strong> — Llamanos
            </a>
            <a :href="whatsappUrl()" target="_blank" rel="noopener noreferrer">
              <MessageCircle :size="14" class="location__contact-icon" aria-hidden="true" />
              WhatsApp — {{ site.whatsappNumber }}
            </a>
          </div>
        </address>

        <div class="location__card">
          <h3 class="location__hours-title">Horarios</h3>
          <p class="location__status" :class="status.open ? 'is-open' : 'is-closed'">
            {{ status.label }} · {{ status.note }}
          </p>
          <ul class="location__hours">
            <li
              v-for="h in site.hours"
              :key="h.day"
              :class="{ 'is-today': h.day === todayName }"
            >
              <span>{{ h.day }}</span>
              <span>{{ h.open }} – {{ h.close }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="location__map">
        <iframe
          :src="site.mapsEmbed"
          title="Mapa de Mareas Gastrobar Tropical, Barrio Lourdes, Ciudad Quesada"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </section>
</template>

<style scoped>
.location {
  background:
    radial-gradient(100% 60% at 10% 100%, rgba(201, 162, 39, 0.08) 0%, transparent 60%),
    var(--bg-panel);
  border-top: 1px solid rgba(245, 239, 224, 0.07);
}

.location__head {
  margin-bottom: 30px;
}

.location__grid {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

.location__card {
  font-style: normal;
  background: var(--bg-panel-2);
  border: 1px solid rgba(245, 239, 224, 0.08);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: grid;
  gap: 20px;
  align-content: start;
}

.location__address {
  font-size: 1.02rem;
  line-height: 1.55;
}

.location__actions {
  display: grid;
  gap: 10px;
}

.location__contact {
  display: grid;
  gap: 8px;
  font-size: 0.92rem;
  border-top: 1px solid rgba(245, 239, 224, 0.08);
  padding-top: 16px;
}

.location__contact a {
  display: flex;
  align-items: center;
  gap: 7px;
}

.location__contact-icon {
  color: var(--gold-light);
  flex-shrink: 0;
}

.location__hours-title {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.95rem;
}

.location__status {
  font-size: 0.85rem;
  font-weight: 600;
}

.location__status.is-open {
  color: var(--green-bright);
}

.location__status.is-closed {
  color: var(--muted);
}

.location__hours {
  list-style: none;
  display: grid;
  gap: 4px;
  font-size: 0.92rem;
}

.location__hours li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--muted);
}

.location__hours li.is-today {
  background: rgba(46, 158, 91, 0.14);
  color: var(--cream);
  font-weight: 600;
}

.location__hours li.is-today span:last-child {
  color: var(--green-bright);
}

.location__map {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(245, 239, 224, 0.08);
}

.location__map iframe {
  display: block;
  width: 100%;
  height: 260px;
  border: 0;
}

@media (min-width: 768px) {
  .location__grid {
    grid-template-columns: 1fr 1fr;
  }

  .location__actions {
    grid-template-columns: 1fr;
  }

  .location__map iframe {
    height: 360px;
  }
}
</style>