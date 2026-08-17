<script setup>
import { AlertTriangle, Trash2 } from "lucide-vue-next";
import ModalDialog from "./ModalDialog.vue";

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "¿Confirmar acción?" },
  message: { type: String, default: "" },
  confirmLabel: { type: String, default: "Confirmar" },
  danger: { type: Boolean, default: false },
});

const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
  <ModalDialog :open="open" :title="title" width="440px" @close="emit('cancel')">
    <div class="adm-confirm">
      <span class="adm-confirm__icon" :class="{ 'is-danger': danger }" aria-hidden="true">
        <AlertTriangle v-if="danger" :size="22" />
        <Trash2 v-else :size="22" />
      </span>
      <p class="adm-confirm__message">{{ message }}</p>
    </div>
    <template #footer>
      <button class="btn btn--ghost" type="button" @click="emit('cancel')">Cancelar</button>
      <button
        class="btn"
        :class="danger ? 'adm-btn--danger' : 'btn--primary'"
        type="button"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </template>
  </ModalDialog>
</template>