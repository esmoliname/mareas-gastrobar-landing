<script setup>
import { computed, reactive, ref } from "vue";
import { AlertTriangle, CalendarDays, CheckCircle2, Loader2, Send, Users } from "lucide-vue-next";
import { reservationWhatsappUrl } from "../services/reservations.js";
import { useReservationStore } from "../stores/reservations.js";
import { config } from "../config/index.js";
import { toMinutes, format12h } from "../utils/hours.js";
import { notifyError } from "../utils/toast.js";
import WhatsappIcon from "./WhatsappIcon.vue";

const reservations = useReservationStore();

const OPEN = config.hours.open;
const CLOSE_WEEKDAY = config.hours.closeWeekday;
const CLOSE_WEEKEND = config.hours.closeWeekend;
const EXTENDED_DAYS = config.hours.extendedDays;
const HIGH_FLOW_AFTER = config.businessRules.highFlowAfter;
const MAX_GUESTS = config.businessRules.maxGuests;
const MAX_DAYS_AHEAD = config.businessRules.maxReservationDaysAhead;
const MAX_NOTES_LENGTH = config.businessRules.maxDescriptionLength;

const form = reactive({
  name: "",
  phone: "",
  guests: 2,
  date: "",
  time: "",
  notes: "",
});

const errors = reactive({});
const sent = ref(false);
const savedLocally = ref(false);
const submitting = ref(false);

const today = computed(() => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
});

const maxDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + MAX_DAYS_AHEAD);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
});

const selectedDay = computed(() => {
  if (!form.date) return -1;
  return new Date(`${form.date}T12:00:00`).getDay();
});

const isExtendedDay = computed(() => EXTENDED_DAYS.includes(selectedDay.value));

const closingTime = computed(() => (isExtendedDay.value ? CLOSE_WEEKEND : CLOSE_WEEKDAY));

const availableTimes = computed(() => {
  const slots = [];
  const pad = (n) => String(n).padStart(2, "0");
  for (let h = 11; h < 24; h += 0.5) {
    const hour = Math.floor(h);
    const minute = h % 1 === 0 ? "00" : "30";
    slots.push(`${pad(hour)}:${minute}`);
  }
  if (isExtendedDay.value) {
    slots.push("00:00");
    slots.push("00:30");
  }
  return slots;
});

const isHighFlow = computed(() => {
  if (!form.date || !form.time) return false;
  const flowMin = toMinutes(HIGH_FLOW_AFTER);
  const selectedMin = toMinutes(form.time);
  return isExtendedDay.value && selectedMin >= flowMin;
});

function validate() {
  errors.name = "";
  errors.phone = "";
  errors.date = "";
  errors.time = "";

  if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Ingresá tu nombre.";
  if (!/^[0-9+\-\s]{8,16}$/.test(form.phone.trim())) errors.phone = "Ingresá un teléfono válido (ej: 8xxx-xxxx).";
  if (!form.date) errors.date = "Elegí la fecha de tu reserva.";
  if (!form.time) errors.time = "Elegí la hora de tu reserva.";

  if (form.date && !errors.date) {
    const d = new Date(`${form.date}T12:00:00`);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (d < now) errors.date = "La fecha no puede ser en el pasado.";
    if (d > new Date(`${maxDate.value}T12:00:00`)) errors.date = `Solo aceptamos reservas hasta ${MAX_DAYS_AHEAD} días antes.`;
  }

  if (form.date && form.time && !errors.time) {
    const timeMin = toMinutes(form.time);
    const openMin = toMinutes(OPEN);
    const closeWeekdayMin = toMinutes(CLOSE_WEEKDAY);

    if (isExtendedDay.value && timeMin < 45) {
      // Slots 00:00 / 00:30 → madrugada del día siguiente, dentro del horario extendido
      return true;
    }
    if (timeMin < openMin) {
      errors.time = `Abrimos a las ${format12h(OPEN)}. Elegí un horario dentro del horario comercial.`;
    } else if (timeMin >= closeWeekdayMin) {
      errors.time = `Cerramos a las ${format12h(CLOSE_WEEKDAY)} (o ${format12h(CLOSE_WEEKEND)} en fin de semana). Elegí antes de esa hora.`;
    }
  }

  return Object.values(errors).every((e) => !e);
}

function submit() {
  if (!validate()) {
    notifyError("Revisá los campos marcados para completar tu reserva.");
    return;
  }
  submitting.value = true;

  setTimeout(() => {
    const payload = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim().slice(0, MAX_NOTES_LENGTH),
    };
    reservations.register(payload);
    savedLocally.value = true;
    window.open(reservationWhatsappUrl(payload), "_blank", "noopener,noreferrer");
    sent.value = true;
    submitting.value = false;
  }, 600);
}

function resetForm() {
  sent.value = false;
  savedLocally.value = false;
  Object.assign(form, { name: "", phone: "", guests: 2, date: "", time: "", notes: "" });
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}
</script>

<template>
  <section id="reservas" class="section reservation">
    <div class="container">
      <div class="reservation__grid">
        <div class="reservation__intro">
          <p class="eyebrow">Reservaciones</p>
          <h2>Apartá tu <span class="gold-italic">mesa</span></h2>
          <p class="u-muted">
            Viernes y sábados el local se llena temprano. Reservá y asegurate el mejor lugar de la casa.
          </p>
          <ul class="reservation__facts">
            <li><CalendarDays :size="17" aria-hidden="true" /> Lun–Dom: {{ format12h(config.hours.open) }} – {{ format12h(config.hours.closeWeekday) }}</li>
            <li><CalendarDays :size="17" aria-hidden="true" /> Viernes y Sábado: hasta {{ format12h(config.hours.closeWeekend) }}</li>
            <li><Users :size="17" aria-hidden="true" /> Grupos desde 1 hasta {{ MAX_GUESTS }} comensales</li>
          </ul>
        </div>

        <form v-if="!sent" class="reservation__card" novalidate @submit.prevent="submit">
          <div class="reservation__row">
            <label class="field">
              <span>Nombre *</span>
              <input v-model="form.name" type="text" placeholder="Tu nombre" autocomplete="name" />
              <small v-if="errors.name" class="field__error">{{ errors.name }}</small>
            </label>
            <label class="field">
              <span>Teléfono *</span>
              <input v-model="form.phone" type="tel" inputmode="tel" placeholder="8xxx-xxxx" autocomplete="tel" />
              <small v-if="errors.phone" class="field__error">{{ errors.phone }}</small>
            </label>
          </div>

          <div class="reservation__row">
            <label class="field">
              <span>Fecha *</span>
              <input v-model="form.date" type="date" :min="today" :max="maxDate" />
              <small v-if="errors.date" class="field__error">{{ errors.date }}</small>
            </label>
            <label class="field">
              <span>Hora *</span>
              <select v-model="form.time">
                <option value="" disabled>Elegí la hora…</option>
                <option v-for="t in availableTimes" :key="t" :value="t">{{ t }}</option>
              </select>
              <small v-if="errors.time" class="field__error">{{ errors.time }}</small>
              <small v-else class="field__hint">Atención hasta las {{ format12h(closingTime) }} ({{ isExtendedDay ? "fin de semana" : "entre semana" }})</small>
            </label>
          </div>

          <label class="field">
            <span>Comensales</span>
            <input v-model.number="form.guests" type="number" min="1" :max="MAX_GUESTS" inputmode="numeric" />
          </label>

          <label class="field">
            <span>Notas (opcional)</span>
            <textarea v-model="form.notes" rows="2" :maxlength="MAX_NOTES_LENGTH" placeholder="Ocasión especial, silla de bebé, preferencia de mesa…"></textarea>
          </label>

          <div v-if="isHighFlow" class="reservation__alert" role="status">
            <AlertTriangle :size="17" aria-hidden="true" />
            <p>
              <strong>Alta afluencia:</strong> las noches de viernes y sábado después de las 8:30 p.m. el local
              suele estar a capacidad. Te recomendamos reservar temprano o llamar para confirmar disponibilidad.
            </p>
          </div>

          <button class="btn btn--wa reservation__submit" type="submit" :disabled="submitting">
            <Loader2 v-if="submitting" :size="18" class="reservation__spin" aria-hidden="true" />
            <WhatsappIcon v-else :size="20" />
            {{ submitting ? "Enviando…" : "Reservar por WhatsApp" }}
          </button>
          <p class="reservation__privacy">
            <Send :size="13" aria-hidden="true" />
            Tu solicitud se envía directo a nuestro WhatsApp y queda pre-registrada en este dispositivo.
          </p>
        </form>

        <div v-else class="reservation__card reservation__card--done">
          <CheckCircle2 :size="44" class="reservation__done-icon" aria-hidden="true" />
          <h3>¡Solicitud lista!</h3>
          <p>
            Abrimos WhatsApp con tu reserva lista para enviar
            {{ savedLocally ? "y ya la guardamos como pre-registro en este dispositivo." : "." }}
          </p>
          <p class="u-muted">
            {{ form.name }} · {{ form.guests }} comensales · {{ form.date }} a las {{ form.time }}
          </p>
          <button class="btn btn--ghost reservation__again" type="button" @click="resetForm">
            Hacer otra reserva
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reservation {
  scroll-margin-top: calc(var(--header-h) + 8px);
  background:
    radial-gradient(80% 60% at 15% 10%, rgba(46, 158, 91, 0.1) 0%, transparent 55%),
    var(--bg-deep);
  border-top: 1px solid rgba(245, 239, 224, 0.06);
}

.reservation__grid {
  display: grid;
  gap: 34px;
}

@media (min-width: 900px) {
  .reservation__grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.reservation__intro {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reservation__facts {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.reservation__facts li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--sand);
}

.reservation__facts svg {
  color: var(--gold-light);
  flex-shrink: 0;
}

.reservation__card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  border-radius: var(--radius-lg);
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.1);
  box-shadow: var(--shadow-card);
}

.reservation__row {
  display: grid;
  gap: 14px;
}

@media (min-width: 640px) {
  .reservation__row {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sand);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.16);
  background: var(--bg-panel-2);
  color: var(--cream);
  font: inherit;
  font-weight: 400;
  outline: none;
  transition: border-color 0.2s ease;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--gold);
}

.field textarea {
  resize: vertical;
}

.field__hint {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.72rem;
}

.field__error {
  color: #ffb3a0;
  font-weight: 500;
  font-size: 0.74rem;
}

.reservation__alert {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.4);
  color: var(--sand);
  font-size: 0.8rem;
}

.reservation__alert svg {
  color: var(--gold-light);
  flex-shrink: 0;
  margin-top: 2px;
}

.reservation__submit {
  width: 100%;
}

.reservation__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.reservation__spin {
  animation: res-spin 1s linear infinite;
}

@keyframes res-spin {
  to {
    transform: rotate(360deg);
  }
}

.reservation__privacy {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  color: var(--muted);
  font-size: 0.72rem;
  text-align: center;
}

.reservation__card--done {
  align-items: center;
  text-align: center;
  padding: 40px 28px;
}

.reservation__done-icon {
  color: var(--green-bright);
}

.reservation__card--done p {
  color: var(--sand);
  font-size: 0.9rem;
  max-width: 38ch;
}

.reservation__again {
  margin-top: 8px;
}
</style>