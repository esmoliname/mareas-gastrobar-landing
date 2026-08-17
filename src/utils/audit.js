import { reactive } from "vue";
import { storageGetJSON, storageSetJSON } from "./storage.js";

// Bitácora de actividad del panel: registra eventos sensibles (login,
// cambios al catálogo, personalización) con marca de tiempo. Máximo 100
// entradas (rotación FIFO). Solo vive en el navegador del admin.

const KEY = "mareas:audit:v1";
const MAX_ENTRIES = 100;

export const auditLog = reactive([]);

function load() {
  const parsed = storageGetJSON(KEY);
  if (Array.isArray(parsed)) {
    auditLog.push(...parsed.slice(0, MAX_ENTRIES));
  }
}

function persist() {
  storageSetJSON(KEY, auditLog);
}

export function audit(action, detail = "", actor = "") {
  auditLog.unshift({
    ts: Date.now(),
    action: String(action).slice(0, 40),
    detail: String(detail).slice(0, 120),
    actor: String(actor).slice(0, 40),
  });
  if (auditLog.length > MAX_ENTRIES) auditLog.splice(MAX_ENTRIES);
  persist();
}

export function clearAudit() {
  auditLog.splice(0);
  persist();
}

export function formatAuditTime(ts) {
  return new Date(ts).toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

load();