<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useClipboard } from "../../composables/useClipboard.js";
import { sanitizeDigits } from "../../utils/validation.js";
import { notifyError, notifySuccess } from "../../utils/toast.js";
import { audit } from "../../utils/audit.js";
import AdminCard from "../ui/AdminCard.vue";
import QrPreview from "./qr/QrPreview.vue";
import QrControls from "./qr/QrControls.vue";

const tableNumber = ref("");
const menuUrl = ref("");
const qrDataUrl = ref("");
const generating = ref(false);

const { copied, copy } = useClipboard();

const fileName = computed(() => `mareas-mesa-${tableNumber.value || "menu"}-${new Date().toISOString().slice(0, 10)}.png`);
const pdfFileName = computed(() => `mareas-mesa-${tableNumber.value || "menu"}-${new Date().toISOString().slice(0, 10)}.pdf`);
const targetUrl = computed(() => buildQrUrl());

onMounted(() => {
  menuUrl.value = window.location.origin + "/";
  generate();
});

watch([menuUrl, tableNumber], generate);

function onTableInput(e) {
  tableNumber.value = sanitizeDigits(e.target.value);
}

function buildQrUrl() {
  const base = menuUrl.value.trim().replace(/\/+$/, "");
  const cleanTable = tableNumber.value.trim();
  if (!cleanTable) return `${base}/`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}mesa=${encodeURIComponent(cleanTable)}`;
}

async function generate() {
  if (!menuUrl.value.trim()) return;
  generating.value = true;
  try {
    qrDataUrl.value = await QRCode.toDataURL(buildQrUrl(), {
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

function download() {
  const a = document.createElement("a");
  a.href = qrDataUrl.value;
  a.download = fileName.value;
  a.click();
  audit("qr.download_png", `mesa ${tableNumber.value || "general"}`);
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
  audit("qr.export_pdf", `mesa ${tableNumber.value || "general"}`);
  notifySuccess("PDF A4 generado y descargado.");
}

async function copyUrl() {
  const ok = await copy(buildQrUrl());
  if (ok) notifySuccess("URL del QR copiada al portapapeles.");
  else notifyError("No se pudo copiar la URL. Copiala manualmente.");
}
</script>

<template>
  <AdminCard
    title="Generador de Códigos QR por Mesa"
    subtitle="Generá un QR parametrizado con el número de mesa. Al escanearlo, el cliente entra al menú con su mesa ya seleccionada y el pedido llega a WhatsApp identificado."
  >
    <div class="qr__main">
      <QrPreview :qr-data-url="qrDataUrl" :table="tableNumber" :generating="generating" />
      <QrControls
        :table="tableNumber"
        v-model:menu-url="menuUrl"
        :qr-ready="Boolean(qrDataUrl)"
        :copied="copied"
        :target-url="targetUrl"
        @update:table="onTableInput"
        @copy-url="copyUrl"
        @download="download"
        @export-pdf="exportPdf"
      />
    </div>
  </AdminCard>
</template>

<style scoped>
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
</style>