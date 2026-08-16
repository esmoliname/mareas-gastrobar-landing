<script setup>
import { AlertCircle, CheckCircle2, Info, X } from "lucide-vue-next";
import { toasts, dismiss } from "../utils/toast.js";

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
</script>

<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`" role="status">
          <component :is="icons[toast.type]" :size="17" class="toast__icon" aria-hidden="true" />
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" type="button" :aria-label="'Cerrar notificación'" @click="dismiss(toast.id)">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: calc(var(--header-h) + 14px);
  right: 14px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(calc(100vw - 28px), 360px);
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 13px;
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.14);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
  color: var(--cream);
  font-size: 0.84rem;
}

.toast--success .toast__icon {
  color: var(--green-bright);
}

.toast--error .toast__icon {
  color: var(--coral);
}

.toast--info .toast__icon {
  color: var(--gold-light);
}

.toast__message {
  flex: 1;
  min-width: 0;
}

.toast__close {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  flex-shrink: 0;
}

.toast__close:hover {
  color: var(--gold-light);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(18px);
}
</style>