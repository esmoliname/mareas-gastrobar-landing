<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Download, FileText, Link2, RefreshCw, Copy, Check, Table2 } from "lucide-vue-next";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { config } from "../../config/index.js";
import { notifyError, notifySuccess } from "../../utils/toast.js";

const tableNumber = ref("");
const menuUrl = ref("");
const qrDataUrl = ref("");
const generating = ref(false);
const copied = ref(false);
const fileName = computed(() => `mareas-mesa-${tableNumber.value || "menu"}-${new Date().toISOString().slice(0, 10)}.png`);
const pdfFileName = computed(() => `mareas-mesa-${tableNumber.value || "menu"}-${new Date().toISOString().slice(0, 10)}.pdf`);

onMounted(() => {
  menuUrl.value = window.location.origin + "/";
  generate();
});

watch([menuUrl, tableNumber], generate);

function onTableInput(e) {
  // Sanitización estricta: solo dígitos y dentro del rango de mesas permitido (1–99).
  const maxLen = String(config.businessRules.maxTableNumber).length;
  tableNumber.value = String(e.target.value).replace(/\D/g, "").slice(0, maxLen);
}

async function generate() {
  if (!menuUrl.value.trim()) return;
  generating.value = true;
  try {
    const url = buildQrUrl();
    qrDataUrl.value = await QRCode.toDataURL(url, {
      width: 800,
      margin: 2,
      color: { dark: "#0b1210", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
  } catch (e) {
    qrDataUrl.value = "";
    console.error("Error generando QR:", e);
  } finally {
    generating.value = false;
  }
}

function buildQrUrl() {
  const base = menuUrl.value.trim().replace(/\/+$/, "");
  const cleanTable = tableNumber.value.trim();
  if (!cleanTable) return `${base}/`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}mesa=${encodeURIComponent(cleanTable)}`;
}

function download() {
  const a = document.createElement("a");
  a.href = qrDataUrl.value;
  a.download = fileName.value;
  a.click();
  notifySuccess("Imagen PNG descargada.");
}

function exportPdf() {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const brand = "MAREAS · GASTROBAR TROPICAL";
  const label = tableNumber.value.trim() ? `Código QR — Mesa ${tableNumber.value}` : "Código QR — Menú digital";
  const sub = "Escaneá para ver el menú y pedir desde la mesa.";

  doc.setFillColor(11, 18, 16);
  doc.rect(0, 0, 297, 210, "F");
  doc.setFillColor(30, 122, 70);
  doc.rect(0, 0, 297, 10, "F");

  doc.setTextColor(217, 178, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(brand, 148, 32, { align: "center" });

  doc.setTextColor(255, 253, 247);
  doc.setFontSize(34);
  doc.text(label, 148, 52, { align: "center" });

  doc.setTextColor(159, 176, 166);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(sub, 148, 62, { align: "center" });

  doc.addImage(qrDataUrl.value, "PNG", 78, 72, 140, 140);

  doc.setTextColor(217, 178, 60);
  doc.setFontSize(11);
  doc.text(buildQrUrl(), 148, 196, { align: "center" });

  doc.save(pdfFileName.value);
  notifySuccess("PDF A4 generado y descargado.");
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(buildQrUrl());
    copied.value = true;
    notifySuccess("URL del QR copiada al portapapeles.");
    setTimeout(() => (copied.value = false), 1600);
  } catch {
    notifyError("No se pudo copiar la URL. Copiala manualmente.");
  }
}
</script>

<template>
  <section class="admin-card qr">
    <div class="qr__main">
      <div class="qr__preview">
        <div class="qr__frame" :class="{ 'is-busy': generating }">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="Código QR del menú digital de Mareas" class="qr__img" />
          <RefreshCw v-else :size="28" class="qr__spin" aria-hidden="true" />
        </div>
        <p class="qr__caption">
          {{ tableNumber.trim() ? `Mesa ${tableNumber.trim()} — escaneá y pedí desde tu mesa` : "Menú digital — escaneá para pedir" }}
        </p>
      </div>

      <div class="qr__controls">
        <h2 class="admin-card__title">Generador de Códigos QR por Mesa</h2>
        <p class="admin-card__subtitle">
          Generá un QR parametrizado con el número de mesa. Al escanearlo, el cliente entra al menú con
          <strong>su mesa ya seleccionada</strong> y el pedido llega a WhatsApp identificado.
        </p>

        <label class="field">
          <span>Número de mesa</span>
          <div class="qr__input-row">
            <Table2 :size="16" class="qr__input-icon" aria-hidden="true" />
            <input :value="tableNumber" type="text" inputmode="numeric" placeholder="Ej: 5 (vacío = menú general)" @input="onTableInput" />
          </div>
          <small class="field__hint">Cada mesa necesita su propio código. Dejalo vacío para el QR general del menú.</small>
        </label>

        <label class="field">
          <span>URL base del menú digital</span>
          <div class="qr__input-row">
            <Link2 :size="16" class="qr__input-icon" aria-hidden="true" />
            <input v-model="menuUrl" type="url" placeholder="https://tu-dominio.com/" />
            <button class="icon-btn" type="button" :aria-label="copied ? 'URL copiada' : 'Copiar URL'" @click="copyUrl">
              <Check v-if="copied" :size="15" class="qr__copied" />
              <Copy v-else :size="15" />
            </button>
          </div>
          <small class="field__hint">El QR apunta a: <code>{{ buildQrUrl() }}</code></small>
        </label>

        <div class="qr__actions">
          <button class="btn btn--primary" type="button" :disabled="!qrDataUrl" @click="download">
            <Download :size="17" aria-hidden="true" />
            PNG para imprimir
          </button>
          <button class="btn btn--ghost" type="button" :disabled="!qrDataUrl" @click="exportPdf">
            <FileText :size="17" aria-hidden="true" />
            PDF (A4 horizontal)
          </button>
        </div>

        <ul class="qr__tips">
          <li>Imprimí en tamaño mínimo 8 × 8 cm para escaneo rápido desde el celular.</li>
          <li>El QR incluye <code>?mesa=X</code> y la mesa queda pre-seleccionada en el pedido.</li>
          <li>El estado "disponible / agotado" del catálogo se refleja directo en el menú escaneado.</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.qr {
  max-width: 860px;
}

.qr__main {
  display: grid;
  gap: 28px;
}

@media (min-width: 768px) {
  .qr__main {
    grid-template-columns: 300px 1fr;
    align-items: start;
  }
}

.qr__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr__frame {
  display: grid;
  place-items: center;
  width: 260px;
  height: 260px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-card);
}

.qr__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr__frame.is-busy {
  opacity: 0.6;
}

.qr__spin {
  color: var(--green);
  animation: qr-spin 1s linear infinite;
}

@keyframes qr-spin {
  to {
    transform: rotate(360deg);
  }
}

.qr__caption {
  font-size: 0.78rem;
  color: var(--muted);
  text-align: center;
}

.qr__controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sand);
}

.qr__input-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr__input-icon {
  position: absolute;
  left: 12px;
  color: var(--muted);
  pointer-events: none;
}

.qr__input-row input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px 10px 38px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.16);
  background: var(--bg-panel-2);
  color: var(--cream);
  font: inherit;
  font-weight: 400;
  outline: none;
}

.qr__input-row input:focus {
  border-color: var(--gold);
}

.qr__copied {
  color: var(--green-bright);
}

.field__hint {
  color: var(--muted);
  font-weight: 400;
  font-size: 0.72rem;
}

.field__hint code {
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--bg-deep);
  color: var(--gold-light);
  font-size: 0.7rem;
}

.qr__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.qr__actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qr__tips {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--bg-panel-2);
  border: 1px solid rgba(245, 239, 224, 0.08);
  font-size: 0.82rem;
  color: var(--muted);
}

.qr__tips li::before {
  content: "→ ";
  color: var(--gold);
  font-weight: 700;
}

.qr__tips code {
  padding: 1px 5px;
  border-radius: 6px;
  background: var(--bg-deep);
  color: var(--gold-light);
  font-size: 0.72rem;
}
</style>