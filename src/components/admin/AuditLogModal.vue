<script setup>
import { computed } from "vue";
import { Clock, ShieldCheck, Trash2 } from "lucide-vue-next";
import { auditLog, clearAudit, formatAuditTime } from "../../utils/audit.js";
import ModalDialog from "../ui/ModalDialog.vue";

defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const ACTIONS = {
  "auth.login": "Inicio de sesión",
  "auth.login_fail": "Intento de inicio de sesión fallido",
  "auth.logout": "Cierre de sesión",
  "auth.lockout": "Bloqueo por intentos fallidos",
  "auth.auto_logout": "Sesión cerrada por inactividad",
  "catalog.create": "Platillo creado",
  "catalog.update": "Platillo actualizado",
  "catalog.remove": "Platillo eliminado",
  "catalog.toggle": "Disponibilidad actualizada",
  "catalog.reset": "Catálogo restaurado",
  "settings.theme": "Tema de color cambiado",
  "settings.banner": "Banner de temporada actualizado",
  "qr.download_png": "QR descargado (PNG)",
  "qr.export_pdf": "QR exportado (PDF)",
};

const entries = computed(() => [...auditLog]);

function actionLabel(action) {
  return ACTIONS[action] || action;
}
</script>

<template>
  <ModalDialog :open="open" title="Bitácora de auditoría" width="680px" @close="emit('close')">
    <div class="audit">
      <div v-if="entries.length" class="audit__toolbar">
        <span class="audit__count">
          <ShieldCheck :size="15" aria-hidden="true" />
          {{ entries.length }} {{ entries.length === 1 ? "evento" : "eventos" }} · últimos 100
        </span>
        <button class="btn btn--ghost adm-btn--sm" type="button" @click="clearAudit">
          <Trash2 :size="14" aria-hidden="true" />
          Vaciar
        </button>
      </div>

      <ul v-if="entries.length" class="audit__list">
        <li v-for="entry in entries" :key="entry.id || entry.ts" class="audit__row">
          <span class="audit__time" :title="new Date(entry.ts).toLocaleString()">
            <Clock :size="13" aria-hidden="true" />
            {{ formatAuditTime(entry.ts) }}
          </span>
          <span class="audit__action">{{ actionLabel(entry.action) }}</span>
          <span class="audit__detail">{{ entry.detail }}</span>
        </li>
      </ul>

      <p v-else class="audit__empty">
        Todavía no hay eventos registrados. La bitácora guarda acciones sensibles
        (accesos, cambios de catálogo, temas, QR) en este navegador.
      </p>
    </div>
  </ModalDialog>
</template>

<style scoped>
.audit {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 60vh;
  overflow: hidden;
}

.audit__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}

.audit__count {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  color: var(--muted);
}

.audit__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(245, 239, 224, 0.08);
  border-radius: var(--radius-md);
  background: var(--bg-panel-2);
}

.audit__row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 4px 14px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(245, 239, 224, 0.06);
}

.audit__row:last-child {
  border-bottom: 0;
}

.audit__time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.audit__action {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cream);
}

.audit__detail {
  grid-column: 2;
  font-size: 0.78rem;
  color: var(--muted);
  word-break: break-word;
}

.audit__empty {
  margin: 0;
  padding: 28px 20px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--muted);
  border: 1px dashed rgba(245, 239, 224, 0.14);
  border-radius: var(--radius-md);
}
</style>