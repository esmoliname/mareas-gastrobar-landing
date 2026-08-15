<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { X, Box, ScanLine, Maximize2, Loader2 } from "lucide-vue-next";
import { formatColones } from "../utils/format.js";
import "@google/model-viewer";

const props = defineProps({
  item: { type: Object, required: false, default: null },
});

const emit = defineEmits(["close"]);

const open = computed(() => Boolean(props.item));
const viewerRef = ref(null);
const loading = ref(true);
const arSupported = ref(false);
const arError = ref("");

function onKeydown(e) {
  if (e.key === "Escape" && open.value) emit("close");
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});

watch(open, async (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (!isOpen) return;
  loading.value = true;
  arError.value = "";
  await nextTick();
  const viewer = viewerRef.value;
  if (viewer) {
    try {
      const can = typeof viewer.canActivateAR === "function" ? await viewer.canActivateAR : false;
      arSupported.value = Boolean(can);
    } catch {
      arSupported.value = false;
    }
  }
});

function onLoad() {
  loading.value = false;
}

function onError(e) {
  loading.value = false;
  arError.value = "No se pudo cargar el modelo 3D. Revisá tu conexión e intentá de nuevo.";
}

async function launchAr() {
  const viewer = viewerRef.value;
  if (!viewer) return;
  try {
    const can = typeof viewer.canActivateAR === "function" ? await viewer.canActivateAR : false;
    if (can) {
      viewer.activateAR();
    } else {
      arError.value = "Tu dispositivo no soporta Realidad Aumentada. Podés explorar el modelo en 3D acá mismo.";
    }
  } catch {
    arError.value = "Tu dispositivo no soporta Realidad Aumentada. Podés explorar el modelo en 3D acá mismo.";
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="ar">
      <div v-if="open" class="ar-modal" role="dialog" aria-modal="true" aria-label="Vista 3D y Realidad Aumentada" @click.self="emit('close')">
        <div class="ar-modal__panel">
          <button class="ar-modal__close" type="button" aria-label="Cerrar" @click="emit('close')">
            <X :size="22" />
          </button>

          <div class="ar-modal__stage">
            <div v-if="loading" class="ar-modal__loader">
              <Loader2 :size="26" class="ar-modal__spin" aria-hidden="true" />
              <span>Preparando modelo 3D…</span>
            </div>

            <model-viewer
              v-if="item"
              ref="viewerRef"
              :src="item.model || 'https://modelviewer.dev/shared-assets/models/watermelon.glb'"
              :alt="`Modelo 3D de ${item.name}`"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              autoplay
              shadow-intensity="1.2"
              exposure="1.1"
              @load="onLoad"
              @error="onError"
            ></model-viewer>

            <div v-if="arError" class="ar-modal__error" role="alert">
              <Box :size="18" aria-hidden="true" />
              <span>{{ arError }}</span>
            </div>
          </div>

          <div class="ar-modal__info">
            <div class="ar-modal__row">
              <span class="ar-modal__category">{{ item.category }}</span>
              <span class="ar-modal__price">{{ formatColones(item.price) }}</span>
            </div>
            <h3 class="ar-modal__name">{{ item.name }}</h3>
            <p class="ar-modal__desc">{{ item.description }}</p>

            <div class="ar-modal__actions">
              <button class="btn btn--primary ar-modal__ar-btn" type="button" @click="launchAr">
                <ScanLine :size="18" aria-hidden="true" />
                Proyectar en RA
              </button>
              <p class="ar-modal__hint">
                <Maximize2 :size="13" aria-hidden="true" />
                Gira y acerca el modelo con tus dedos. AR disponible en Android (WebXR) e iOS (Quick Look).
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ar-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(4, 8, 6, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.ar-modal__panel {
  position: relative;
  width: min(100%, 560px);
  max-height: calc(100svh - 32px);
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.12);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

.ar-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(245, 239, 224, 0.2);
  background: rgba(11, 18, 16, 0.75);
  color: var(--cream);
}

.ar-modal__close:hover {
  background: rgba(201, 162, 39, 0.2);
  color: var(--gold-light);
}

.ar-modal__stage {
  position: relative;
  height: 320px;
  background:
    radial-gradient(90% 70% at 50% 30%, rgba(46, 158, 91, 0.18) 0%, transparent 60%),
    linear-gradient(180deg, #101c16 0%, #0b1210 100%);
}

@media (min-width: 768px) {
  .ar-modal__stage {
    height: 380px;
  }
}

.ar-modal__stage model-viewer {
  width: 100%;
  height: 100%;
  display: block;
}

.ar-modal__loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted);
  font-size: 0.85rem;
}

.ar-modal__spin {
  color: var(--gold-light);
  animation: ar-spin 1s linear infinite;
}

@keyframes ar-spin {
  to {
    transform: rotate(360deg);
  }
}

.ar-modal__error {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(232, 122, 93, 0.14);
  border: 1px solid rgba(232, 122, 93, 0.4);
  color: #ffb3a0;
  font-size: 0.8rem;
}

.ar-modal__info {
  padding: 20px;
}

.ar-modal__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.ar-modal__category {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--green-bright);
}

.ar-modal__price {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--gold-light);
}

.ar-modal__name {
  font-size: 1.35rem;
}

.ar-modal__desc {
  margin-top: 8px;
  color: var(--muted);
  font-size: 0.9rem;
}

.ar-modal__actions {
  margin-top: 18px;
}

.ar-modal__ar-btn {
  width: 100%;
}

.ar-modal__hint {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.75rem;
  text-align: center;
}

/* Transición */
.ar-enter-active,
.ar-leave-active {
  transition: opacity 0.25s ease;
}

.ar-enter-active .ar-modal__panel,
.ar-leave-active .ar-modal__panel {
  transition: transform 0.25s ease;
}

.ar-enter-from,
.ar-leave-to {
  opacity: 0;
}

.ar-enter-from .ar-modal__panel,
.ar-leave-to .ar-modal__panel {
  transform: translateY(18px) scale(0.97);
}
</style>