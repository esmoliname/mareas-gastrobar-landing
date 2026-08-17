<script setup>
import { RefreshCw } from "lucide-vue-next";

defineProps({
  qrDataUrl: { type: String, default: "" },
  table: { type: String, default: "" },
  generating: { type: Boolean, default: false },
});
</script>

<template>
  <div class="qr-preview">
    <div class="qr-preview__frame" :class="{ 'is-busy': generating }">
      <img
        v-if="qrDataUrl"
        :src="qrDataUrl"
        alt="Código QR del menú digital de Mareas"
        class="qr-preview__img"
      />
      <RefreshCw v-else :size="28" class="qr-preview__spin" aria-hidden="true" />
    </div>
    <p class="qr-preview__caption">
      {{
        table.trim()
          ? `Mesa ${table.trim()} — escaneá y pedí desde tu mesa`
          : "Menú digital — escaneá para pedir"
      }}
    </p>
  </div>
</template>

<style scoped>
.qr-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-preview__frame {
  display: grid;
  place-items: center;
  width: 260px;
  height: 260px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-card);
}

.qr-preview__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-preview__frame.is-busy {
  opacity: 0.6;
}

.qr-preview__spin {
  color: var(--green);
  animation: qr-preview-spin 1s linear infinite;
}

@keyframes qr-preview-spin {
  to {
    transform: rotate(360deg);
  }
}

.qr-preview__caption {
  font-size: 0.78rem;
  color: var(--muted);
  text-align: center;
}
</style>