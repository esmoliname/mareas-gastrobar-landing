<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Loader2, RefreshCw, ScanLine } from "lucide-vue-next";
import { modelCatalog, modelIosSrc } from "../data/models3d.js";
import { loadViewer } from "../utils/viewer.js";

// Vista de diagnóstico /ar-test: galería de todos los modelos self-hosted
// para verificar carga de .glb / .usdz, dimensiones métricas y lanzar AR.
const viewerReady = ref(false);
const cards = ref([]);

const entries = Object.entries(modelCatalog).map(([key, value]) => ({
  key,
  ...value,
  iosSrc: modelIosSrc(value),
  status: "pending",
  progress: 0,
}));

onMounted(async () => {
  try {
    await loadViewer();
    viewerReady.value = true;
    cards.value = entries.map((entry) => ({
      ...entry,
      status: "pending",
      progress: 0,
    }));
  } catch {
    cards.value = entries.map((entry) => ({ ...entry, status: "error" }));
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

function onKeydown(e) {
  if (e.key === "Escape") window.history.back();
}

function onLoad(key) {
  const card = cards.value.find((c) => c.key === key);
  if (card) {
    card.status = "ready";
    card.progress = 1;
  }
}

function onProgress(key, e) {
  const card = cards.value.find((c) => c.key === key);
  if (card) card.progress = Number(e.detail?.totalProgress) || 0;
}

function onError(key) {
  const card = cards.value.find((c) => c.key === key);
  if (card) card.status = "error";
}

function retry(key) {
  const card = cards.value.find((c) => c.key === key);
  if (!card) return;
  card.status = "pending";
  card.progress = 0;
}

async function launchAr(key) {
  const el = document.querySelector(`model-viewer[data-key="${key}"]`);
  if (!el) return;
  try {
    if (el.canActivateAR) el.activateAR();
    else el.setAttribute("ar-modes", "quick-look");
  } catch {
    /* sin AR en este dispositivo */
  }
}

function dimsLabel(card) {
  if (!card.sizeM) return "—";
  const m = card.sizeM;
  return `${(m * 100).toFixed(0)} cm`;
}

function scaleLabel(card) {
  const s = Number(card.scale) || 1;
  if (s === 1) return "1:1";
  return s < 0.01 ? `×${(s * 1000).toFixed(2)}e-3` : `×${s.toFixed(4)}`;
}
</script>

<template>
  <div class="artest">
    <header class="artest__header">
      <div>
        <h1 class="artest__title">Diagnóstico 3D / WebAR</h1>
        <p class="artest__sub">Self-hosted en <code>/public/models/</code> · {{ entries.length }} familias · sin dependencias externas</p>
      </div>
      <a class="artest__back" href="/">← Volver al menú</a>
    </header>

    <div class="artest__grid">
      <article v-for="card in cards" :key="card.key" class="artest__card" :class="`is-${card.status}`">
        <div class="artest__stage">
          <div v-if="!viewerReady || card.status === 'pending'" class="artest__loader">
            <Loader2 :size="20" class="artest__spin" aria-hidden="true" />
            <span>{{ viewerReady ? "Descargando…" : "Cargando visor…" }}</span>
            <div class="artest__progress">
              <div class="artest__progress-bar" :style="{ width: `${Math.round(card.progress * 100)}%` }"></div>
            </div>
          </div>

          <model-viewer
            v-if="viewerReady"
            :key="`${card.key}-${card.progress}`"
            :data-key="card.key"
            :src="card.glb"
            :ios-src="card.iosSrc"
            :alt="`Modelo 3D: ${card.label}`"
            :scale="`${card.scale} ${card.scale} ${card.scale}`"
            :camera-orbit="card.cameraOrbit"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            ar-placement="floor"
            camera-controls
            interaction-prompt="auto"
            auto-rotate
            auto-rotate-delay="0"
            exposure="1.1"
            shadow-intensity="1.8"
            shadow-softness="0.6"
            tone-mapping="aces"
            environment-image="neutral"
            autoplay
            @load="onLoad(card.key)"
            @error="onError(card.key)"
            @progress="onProgress(card.key, $event)"
          ></model-viewer>

          <span v-if="card.status === 'error'" class="artest__badge is-error">FALLO</span>
          <span v-else-if="card.status === 'ready'" class="artest__badge is-ready">OK</span>
        </div>

        <div class="artest__meta">
          <div class="artest__row">
            <h2 class="artest__name">{{ card.label }}</h2>
            <code class="artest__file">{{ card.key }}.glb</code>
          </div>
          <div class="artest__specs">
            <span>Categoría <strong>{{ card.category }}</strong></span>
            <span>Dimensión real ≈ <strong>{{ dimsLabel(card) }}</strong></span>
            <span>Factor escala <strong>{{ scaleLabel(card) }}</strong></span>
            <span>Orbit <code>{{ card.cameraOrbit }}</code></span>
          </div>
          <div class="artest__files">
            <code title="Modelo WebGL / WebXR">{{ card.glb }}</code>
            <code title="Apple Quick Look (iOS)">{{ card.usdz }}</code>
          </div>
          <div class="artest__actions">
            <button class="artest__btn" type="button" :disabled="card.status !== 'ready'" @click="launchAr(card.key)">
              <ScanLine :size="15" aria-hidden="true" />
              Lanzar AR
            </button>
            <button class="artest__btn is-ghost" type="button" @click="retry(card.key)">
              <RefreshCw :size="15" aria-hidden="true" />
              Recargar
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.artest {
  min-height: 100svh;
  padding: 24px 16px 56px;
  color: var(--cream);
  background:
    radial-gradient(120% 90% at 80% -10%, rgba(46, 158, 91, 0.14) 0%, transparent 55%),
    radial-gradient(100% 80% at 0% 100%, rgba(201, 162, 39, 0.1) 0%, transparent 60%),
    var(--bg);
}

.artest__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto 28px;
}

.artest__title {
  font-size: 1.6rem;
}

.artest__sub {
  margin-top: 6px;
  color: var(--muted);
  font-size: 0.85rem;
}

.artest__sub code {
  color: var(--gold-light);
}

.artest__back {
  flex-shrink: 0;
  padding: 8px 14px;
  border: 1px solid rgba(245, 239, 224, 0.2);
  border-radius: 10px;
  color: var(--sand);
  font-size: 0.8rem;
  text-decoration: none;
}

.artest__back:hover {
  color: var(--gold-light);
  border-color: var(--gold);
}

.artest__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}

.artest__card {
  overflow: hidden;
  border: 1px solid rgba(245, 239, 224, 0.14);
  border-radius: var(--radius-lg);
  background: var(--bg-panel-2);
}

.artest__stage {
  position: relative;
  height: 250px;
  background:
    radial-gradient(90% 70% at 50% 30%, rgba(46, 158, 91, 0.18) 0%, transparent 60%),
    linear-gradient(180deg, #101c16 0%, #0b1210 100%);
}

.artest__stage model-viewer {
  width: 100%;
  height: 100%;
  display: block;
}

.artest__loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted);
  font-size: 0.78rem;
}

.artest__spin {
  color: var(--gold-light);
  animation: artest-spin 1s linear infinite;
}

@keyframes artest-spin {
  to {
    transform: rotate(360deg);
  }
}

.artest__progress {
  width: min(200px, 70%);
  height: 5px;
  border-radius: 999px;
  background: rgba(245, 239, 224, 0.12);
  overflow: hidden;
}

.artest__progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--gold), var(--green-bright));
  transition: width 0.2s ease;
}

.artest__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.artest__badge.is-ready {
  background: rgba(46, 158, 91, 0.22);
  border: 1px solid rgba(46, 158, 91, 0.5);
  color: #b7e8c9;
}

.artest__badge.is-error {
  background: rgba(232, 122, 93, 0.22);
  border: 1px solid rgba(232, 122, 93, 0.5);
  color: #ffb3a0;
}

.artest__meta {
  padding: 14px 16px 16px;
}

.artest__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.artest__name {
  font-size: 1.05rem;
}

.artest__file {
  font-size: 0.7rem;
  color: var(--gold-light);
}

.artest__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.76rem;
}

.artest__specs strong {
  color: var(--cream);
}

.artest__specs code {
  color: var(--green-bright);
}

.artest__files {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 10px;
  font-size: 0.66rem;
  color: var(--muted);
  word-break: break-all;
}

.artest__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.artest__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--gold);
  background: var(--gold);
  color: #141414;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.artest__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.artest__btn.is-ghost {
  background: transparent;
  color: var(--sand);
}

.artest__btn.is-ghost:hover {
  color: var(--gold-light);
}
</style>