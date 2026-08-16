<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  Box,
  Flame,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  RefreshCw,
  Rotate3d,
  ScanLine,
  Smartphone,
  X,
} from "lucide-vue-next";
import { formatColones } from "../utils/format.js";
import { resolveModel } from "../data/models3d.js";
import { notifyError } from "../utils/toast.js";

// Import dinámico: el bundle de @google/model-viewer (~1 MB) solo se descarga
// cuando el usuario abre el modal 3D/AR por primera vez.
const loadViewer = () => import("@google/model-viewer");

const props = defineProps({
  item: { type: Object, required: false, default: null },
});

const emit = defineEmits(["close"]);

const open = computed(() => Boolean(props.item));
const viewerRef = ref(null);
const stageRef = ref(null);
const closeBtnRef = ref(null);
const loading = ref(true);
const modelError = ref(false);
const arSupported = ref(false);
const arChecked = ref(false);
const arError = ref("");
const autoRotate = ref(true);
const warmLight = ref(false);
const zoomedIn = ref(false);
const viewerReady = ref(false);

const LOAD_TIMEOUT_MS = 20000;
let loadTimer = null;

const resolved = computed(() => (props.item ? resolveModel(props.item.model) : null));

const isIOS = computed(() => {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
});

const isAndroid = computed(() => /Android/i.test(navigator.userAgent));

const iosQuickLookReady = computed(() => isIOS.value && Boolean(props.item?.usdz));

const arModes = computed(() => (isIOS.value ? "quick-look" : "webxr scene-viewer quick-look"));

const platformLabel = computed(() => {
  if (isIOS.value) return "iOS · Apple Quick Look";
  if (isAndroid.value) return "Android · WebXR / Scene Viewer";
  return "Desktop · Vista 360°";
});

const stageExposure = computed(() => (warmLight.value ? 1.38 : 1.08));
const stageShadow = computed(() => (warmLight.value ? "1.8" : "1.5"));

function webglSupported() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// canActivateAR es un getter booleano síncrono en @google/model-viewer,
// no una función ni una promesa.
function canUseAr() {
  const viewer = viewerRef.value;
  if (!viewer) return false;
  try {
    return Boolean(viewer.canActivateAR);
  } catch {
    return false;
  }
}

function onKeydown(e) {
  if (e.key === "Escape" && open.value) emit("close");
}

onMounted(async () => {
  document.addEventListener("keydown", onKeydown);
  if (!webglSupported()) {
    arError.value = "Tu dispositivo no soporta WebGL, necesario para la vista 3D. Podés ver el platillo en 2D en el menú.";
    return;
  }
  try {
    await loadViewer();
    viewerReady.value = true;
  } catch {
    arError.value = "No se pudo cargar el visor 3D. Revisá tu conexión e intentá de nuevo.";
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
  if (loadTimer) clearTimeout(loadTimer);
});

watch(open, async (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (!isOpen) return;
  loading.value = true;
  modelError.value = false;
  arError.value = "";
  arChecked.value = false;
  arSupported.value = false;
  autoRotate.value = true;
  warmLight.value = false;
  zoomedIn.value = false;
  startLoadWatchdog();
  await nextTick();
  closeBtnRef.value?.focus();
  arSupported.value = canUseAr();
  arChecked.value = true;
});

function onLoad() {
  loading.value = false;
  modelError.value = false;
  if (loadTimer) clearTimeout(loadTimer);
}

function onError() {
  loading.value = false;
  modelError.value = true;
  if (loadTimer) clearTimeout(loadTimer);
  arError.value = "No se pudo cargar el modelo 3D. Revisá tu conexión e intentá de nuevo.";
  notifyError("Falló la carga del modelo 3D. Verificá tu conexión.");
}

function retry() {
  arError.value = "";
  loading.value = true;
  modelError.value = false;
  startLoadWatchdog();
  const viewer = viewerRef.value;
  if (!viewer) return;
  if (typeof viewer.dismissPoster === "function") viewer.dismissPoster();
  const src = resolved.value?.glb || "";
  if (!src) return;
  // model-viewer no expone un método load(): se fuerza la recarga vía src.
  viewer.src = "";
  requestAnimationFrame(() => {
    viewer.src = src;
  });
}

function startLoadWatchdog() {
  if (loadTimer) clearTimeout(loadTimer);
  loadTimer = setTimeout(() => {
    if (loading.value) {
      loading.value = false;
      arError.value = "El modelo 3D tardó demasiado en cargar. Revisá tu conexión o intentá de nuevo.";
    }
  }, LOAD_TIMEOUT_MS);
}

async function launchAr() {
  const viewer = viewerRef.value;
  if (!viewer) return;
  if (canUseAr()) {
    viewer.activateAR();
    return;
  }
  if (isIOS.value && !props.item?.usdz) {
    arError.value = "Este platillo aún no tiene archivo USDZ para iOS. Podés explorarlo en 3D acá mismo.";
  } else {
    arError.value = "Tu dispositivo no soporta Realidad Aumentada. Podés explorar el modelo en 3D acá mismo.";
  }
}

function toggleRotate() {
  autoRotate.value = !autoRotate.value;
}

function resetCamera() {
  const viewer = viewerRef.value;
  if (!viewer) return;
  try {
    viewer.cameraOrbit = "0deg 75deg 105%";
    viewer.fieldOfView = 30;
    if (typeof viewer.resetTurntableRotation === "function") viewer.resetTurntableRotation(0);
  } catch {
    /* API no disponible */
  }
}

function zoom(delta) {
  const viewer = viewerRef.value;
  if (!viewer) return;
  try {
    const current = Number(viewer.fieldOfView) || 30;
    const next = Math.min(45, Math.max(14, current + delta));
    viewer.fieldOfView = next;
    zoomedIn.value = next < 26;
  } catch {
    /* zoom no disponible en este dispositivo */
  }
}

function toggleFullscreen() {
  const el = stageRef.value;
  if (!el) return;
  try {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  } catch {
    /* pantalla completa no disponible */
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="ar">
      <div v-if="open" class="ar-modal" role="dialog" aria-modal="true" aria-label="Vista 3D y Realidad Aumentada" @click.self="emit('close')">
        <div class="ar-modal__panel">
          <button ref="closeBtnRef" class="ar-modal__close" type="button" aria-label="Cerrar" @click="emit('close')">
            <X :size="22" />
          </button>

          <div ref="stageRef" class="ar-modal__stage" :class="{ 'is-warm': warmLight }">
            <img
              v-if="item.image && (loading || modelError)"
              :src="item.image"
              :alt="`Foto de ${item.name}`"
              class="ar-modal__photo"
              :class="{ 'is-loading': loading }"
              aria-hidden="true"
            />

            <div v-if="loading" class="ar-modal__loader">
              <Loader2 :size="26" class="ar-modal__spin" aria-hidden="true" />
              <span>Preparando modelo 3D…</span>
            </div>

            <model-viewer
              v-if="item && viewerReady"
              ref="viewerRef"
              :src="resolved?.glb || item.model"
              :ios-src="item.usdz || undefined"
              :alt="`Modelo 3D de ${item.name}`"
              ar
              :ar-modes="arModes"
              ar-scale="auto"
              ar-placement="floor"
              camera-controls
              touch-action="pan-y"
              interaction-prompt="none"
              :auto-rotate="autoRotate"
              :auto-rotate-delay="0"
              :exposure="stageExposure"
              :shadow-intensity="stageShadow"
              shadow-softness="1"
              environment-image="neutral"
              autoplay
              @load="onLoad"
              @error="onError"
            ></model-viewer>

            <div class="ar-modal__hud" aria-hidden="true">
              <button class="ar-modal__hud-btn" type="button" :class="{ 'is-active': autoRotate }" :title="autoRotate ? 'Detener rotación' : 'Rotación automática'" @click="toggleRotate">
                <Rotate3d :size="16" />
              </button>
              <button class="ar-modal__hud-btn" type="button" :class="{ 'is-active': warmLight }" title="Iluminación cálida" @click="warmLight = !warmLight">
                <Flame :size="16" />
              </button>
              <button class="ar-modal__hud-btn" type="button" title="Alejar" @click="zoom(5)">
                <Minus :size="16" />
              </button>
              <button class="ar-modal__hud-btn" type="button" title="Acercar" @click="zoom(-5)">
                <Plus :size="16" />
              </button>
              <button class="ar-modal__hud-btn" type="button" title="Restablecer cámara" @click="resetCamera">
                <RefreshCw :size="16" />
              </button>
              <button class="ar-modal__hud-btn" type="button" title="Pantalla completa" @click="toggleFullscreen">
                <Maximize2 :size="16" />
              </button>
            </div>

            <div v-if="modelError || (arError && !loading)" class="ar-modal__error" role="alert">
              <Box :size="18" aria-hidden="true" />
              <span>{{ arError }}</span>
              <button v-if="modelError" class="ar-modal__retry" type="button" @click="retry">
                <RefreshCw :size="13" />
                Reintentar
              </button>
            </div>

            <div v-if="!loading && arChecked && !arSupported" class="ar-modal__notice" role="status">
              <Smartphone :size="15" aria-hidden="true" />
              <span v-if="isIOS || isAndroid">
                Sin soporte AR en este dispositivo — usá los gestos táctiles para explorar el modelo en 360°.
              </span>
              <span v-else>
                Este equipo no soporta Realidad Aumentada — arrastrá con el mouse para explorar el modelo en 360°.
              </span>
            </div>
          </div>

          <div class="ar-modal__info">
            <div class="ar-modal__row">
              <span class="ar-modal__category">{{ item.category }} · {{ platformLabel }}</span>
              <span class="ar-modal__price">{{ formatColones(item.price) }}</span>
            </div>
            <h3 class="ar-modal__name">{{ item.name }}</h3>
            <p class="ar-modal__desc">{{ item.description }}</p>

            <div class="ar-modal__actions">
              <button class="btn btn--primary ar-modal__ar-btn" type="button" :disabled="!arChecked" @click="launchAr">
                <ScanLine :size="18" aria-hidden="true" />
                Proyectar en RA
              </button>

              <p v-if="iosQuickLookReady" class="ar-modal__hint">
                <Maximize2 :size="13" aria-hidden="true" />
                iOS: se abre con Apple Quick Look. Gira y acerca con tus dedos.
              </p>
              <p v-else-if="isAndroid" class="ar-modal__hint">
                <Maximize2 :size="13" aria-hidden="true" />
                Android: WebXR o Scene Viewer. Gira y acerca con tus dedos.
              </p>
              <p v-else class="ar-modal__hint">
                <Maximize2 :size="13" aria-hidden="true" />
                Arrastrá para girar, pellizcá para acercar. Usá los botones para ajustar la vista.
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
  width: min(100%, 580px);
  max-height: calc(100svh - 32px);
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: rgba(14, 26, 20, 0.82);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(245, 239, 224, 0.14);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

.ar-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
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
  height: 340px;
  background:
    radial-gradient(90% 70% at 50% 30%, rgba(46, 158, 91, 0.18) 0%, transparent 60%),
    linear-gradient(180deg, #101c16 0%, #0b1210 100%);
}

@media (min-width: 768px) {
  .ar-modal__stage {
    height: 400px;
  }
}

.ar-modal__stage.is-warm {
  background:
    radial-gradient(90% 70% at 50% 30%, rgba(217, 178, 60, 0.22) 0%, transparent 60%),
    linear-gradient(180deg, #1c170f 0%, #0b1210 100%);
}

.ar-modal__stage model-viewer {
  width: 100%;
  height: 100%;
  display: block;
}

.ar-modal__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

.ar-modal__photo.is-loading {
  opacity: 0.35;
  filter: blur(2px);
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

.ar-modal__hud {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ar-modal__hud-btn {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(245, 239, 224, 0.18);
  background: rgba(11, 18, 16, 0.8);
  color: var(--sand);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.ar-modal__hud-btn:hover {
  color: var(--gold-light);
  border-color: var(--gold);
}

.ar-modal__hud-btn.is-active {
  color: var(--gold-light);
  border-color: var(--gold);
  background: rgba(201, 162, 39, 0.18);
}

.ar-modal__error {
  position: absolute;
  left: 16px;
  right: 70px;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(232, 122, 93, 0.16);
  border: 1px solid rgba(232, 122, 93, 0.4);
  color: #ffb3a0;
  font-size: 0.78rem;
}

.ar-modal__error span {
  flex: 1;
  min-width: 0;
}

.ar-modal__retry {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 179, 160, 0.4);
  background: transparent;
  color: #ffb3a0;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}

.ar-modal__retry:hover {
  background: rgba(232, 122, 93, 0.2);
}

.ar-modal__notice {
  position: absolute;
  left: 16px;
  right: 70px;
  bottom: 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(46, 158, 91, 0.14);
  border: 1px solid rgba(46, 158, 91, 0.35);
  color: #b7e8c9;
  font-size: 0.78rem;
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
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green-bright);
}

.ar-modal__price {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--gold-light);
  white-space: nowrap;
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

.ar-modal__ar-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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