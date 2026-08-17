<script setup>
import { Link2, Table2, Check, Copy, Download, FileText } from "lucide-vue-next";

defineProps({
  table: { type: String, default: "" },
  menuUrl: { type: String, default: "" },
  qrReady: { type: Boolean, default: false },
  copied: { type: Boolean, default: false },
  targetUrl: { type: String, default: "" },
});

const emit = defineEmits(["update:table", "update:menu-url", "copy-url", "download", "export-pdf"]);
</script>

<template>
  <div class="qr-controls">
    <label class="adm-field">
      <span class="adm-field__label">Número de mesa</span>
      <div class="qr-controls__input-row">
        <Table2 :size="16" class="qr-controls__input-icon" aria-hidden="true" />
        <input
          :value="table"
          type="text"
          inputmode="numeric"
          placeholder="Ej: 5 (vacío = menú general)"
          @input="emit('update:table', $event.target.value)"
        />
      </div>
      <small class="adm-field__hint">Cada mesa necesita su propio código. Dejalo vacío para el QR general del menú.</small>
    </label>

    <label class="adm-field">
      <span class="adm-field__label">URL base del menú digital</span>
      <div class="qr-controls__input-row">
        <Link2 :size="16" class="qr-controls__input-icon" aria-hidden="true" />
        <input
          :value="menuUrl"
          type="url"
          placeholder="https://tu-dominio.com/"
          @input="emit('update:menu-url', $event.target.value)"
        />
        <button class="adm-icon-btn" type="button" :aria-label="copied ? 'URL copiada' : 'Copiar URL'" @click="emit('copy-url')">
          <Check v-if="copied" :size="15" class="qr-controls__copied" />
          <Copy v-else :size="15" />
        </button>
      </div>
      <small class="adm-field__hint">El QR apunta a: <code>{{ targetUrl }}</code></small>
    </label>

    <div class="qr-controls__actions">
      <button class="btn btn--primary" type="button" :disabled="!qrReady" @click="emit('download')">
        <Download :size="17" aria-hidden="true" />
        PNG para imprimir
      </button>
      <button class="btn btn--ghost" type="button" :disabled="!qrReady" @click="emit('export-pdf')">
        <FileText :size="17" aria-hidden="true" />
        PDF (A4 horizontal)
      </button>
    </div>

    <ul class="qr-controls__tips">
      <li>Imprimí en tamaño mínimo 8 × 8 cm para escaneo rápido desde el celular.</li>
      <li>El QR incluye <code>?mesa=X</code> y la mesa queda pre-seleccionada en el pedido.</li>
      <li>El estado "disponible / agotado" del catálogo se refleja directo en el menú escaneado.</li>
    </ul>
  </div>
</template>

<style scoped>
.qr-controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.qr-controls__input-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr-controls__input-icon {
  position: absolute;
  left: 12px;
  color: var(--muted);
  pointer-events: none;
}

.qr-controls__input-row input {
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

.qr-controls__input-row input:focus {
  border-color: var(--gold);
}

.qr-controls__copied {
  color: var(--green-bright);
}

.qr-controls__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.qr-controls__actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qr-controls__tips {
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
  margin: 0;
}

.qr-controls__tips li::before {
  content: "→ ";
  color: var(--gold);
  font-weight: 700;
}

.qr-controls__tips code {
  padding: 1px 5px;
  border-radius: 6px;
  background: var(--bg-deep);
  color: var(--gold-light);
  font-size: 0.72rem;
}
</style>