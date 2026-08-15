<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Download, QrCode, Link2, RefreshCw, Copy, Check } from "lucide-vue-next";
import QRCode from "qrcode";

const menuUrl = ref("");
const qrDataUrl = ref("");
const generating = ref(false);
const copied = ref(false);
const fileName = computed(() => `mareas-menu-qr-${new Date().toISOString().slice(0, 10)}.png`);

onMounted(() => {
  menuUrl.value = window.location.origin + "/";
  generate();
});

watch(menuUrl, generate);

async function generate() {
  if (!menuUrl.value.trim()) return;
  generating.value = true;
  try {
    qrDataUrl.value = await QRCode.toDataURL(menuUrl.value.trim(), {
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
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(menuUrl.value.trim());
    copied.value = true;
    setTimeout(() => (copied.value = false), 1600);
  } catch {
    /* portapapeles no disponible */
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
        <p class="qr__caption">Menú digital — escaneá para pedir desde la mesa</p>
      </div>

      <div class="qr__controls">
        <h2 class="admin-card__title">Generador de Código QR</h2>
        <p class="admin-card__subtitle">
          El QR apunta al menú digital de Mareas. Imprimilo y colocálo en las mesas para que tus clientes escaneen y pidan al instante.
        </p>

        <label class="field">
          <span>URL del menú digital</span>
          <div class="qr__input-row">
            <Link2 :size="16" class="qr__input-icon" aria-hidden="true" />
            <input v-model="menuUrl" type="url" placeholder="https://tu-dominio.com/" />
            <button class="icon-btn" type="button" :aria-label="copied ? 'URL copiada' : 'Copiar URL'" @click="copyUrl">
              <Check v-if="copied" :size="15" class="qr__copied" />
              <Copy v-else :size="15" />
            </button>
          </div>
          <small class="field__hint">Cualquier cambio regenera el código al instante.</small>
        </label>

        <button class="btn btn--primary qr__download" type="button" :disabled="!qrDataUrl" @click="download">
          <Download :size="17" aria-hidden="true" />
          Descargar PNG (imprimir)
        </button>

        <ul class="qr__tips">
          <li>Imprimí en tamaño mínimo 8 × 8 cm para escaneo rápido desde el celular.</li>
          <li>Colocá el QR en ángulo plano sobre la mesa o en tarjetas plastificadas.</li>
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

.qr__download {
  align-self: flex-start;
}

.qr__download:disabled {
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
</style>