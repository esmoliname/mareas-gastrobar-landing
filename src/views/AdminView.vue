<script setup>
import { defineAsyncComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, LogOut, Palmtree, ShieldCheck, UtensilsCrossed, QrCode, Palette } from "lucide-vue-next";
import AdminCatalog from "../components/admin/AdminCatalog.vue";
import CustomizePanel from "../components/admin/CustomizePanel.vue";
import { useAuthStore } from "../stores/auth.js";

// Carga diferida del generador QR: jspdf + html2canvas se descargan solo
// cuando el admin abre esa pestaña.
const QrGenerator = defineAsyncComponent(() => import("../components/admin/QrGenerator.vue"));

const router = useRouter();
const auth = useAuthStore();

const tabs = [
  { id: "catalog", label: "Catálogo", icon: UtensilsCrossed },
  { id: "qr", label: "Código QR", icon: QrCode },
  { id: "customize", label: "Personalización", icon: Palette },
];

const activeTab = ref("catalog");

function logout() {
  auth.logout();
  router.replace({ name: "login" });
}
</script>

<template>
  <div class="admin">
    <header class="admin__header">
      <div class="container admin__header-inner">
        <div>
          <RouterLink class="admin__back" to="/">
            <ArrowLeft :size="15" aria-hidden="true" />
            Volver al sitio
          </RouterLink>
          <h1 class="admin__title">Panel de Administración</h1>
          <p class="admin__subtitle">Gestión del catálogo, menú digital QR y personalización de Mareas.</p>
        </div>
        <div class="admin__side">
          <div class="admin__brand" aria-hidden="true"><Palmtree :size="26" /></div>
          <div class="admin__user">
            <ShieldCheck :size="16" class="admin__user-icon" aria-hidden="true" />
            <div>
              <strong>{{ auth.displayName }}</strong>
              <span>Sesión activa</span>
            </div>
          </div>
          <button class="admin__logout" type="button" aria-label="Cerrar sesión" title="Cerrar sesión" @click="logout">
            <LogOut :size="17" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <nav class="admin__tabs container" role="tablist" aria-label="Secciones del panel">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="admin__tab"
          :class="{ 'is-active': activeTab === tab.id }"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" :size="16" aria-hidden="true" />
          {{ tab.label }}
        </button>
      </nav>
    </header>

    <main class="container admin__body">
      <AdminCatalog v-if="activeTab === 'catalog'" />
      <QrGenerator v-else-if="activeTab === 'qr'" />
      <CustomizePanel v-else />
    </main>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100svh;
  background:
    radial-gradient(100% 40% at 80% 0%, rgba(30, 122, 70, 0.12) 0%, transparent 60%),
    var(--bg-deep);
}

.admin__header {
  border-bottom: 1px solid rgba(245, 239, 224, 0.08);
  background: var(--bg-panel);
}

.admin__header-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-block: 28px 18px;
}

.admin__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 12px;
}

.admin__back:hover {
  color: var(--gold-light);
}

.admin__title {
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.admin__subtitle {
  margin-top: 6px;
  color: var(--muted);
  font-size: 0.9rem;
  max-width: 52ch;
}

.admin__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.admin__brand {
  display: grid;
  place-items: center;
  color: var(--gold-light);
}

.admin__user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--bg-panel-2);
  border: 1px solid rgba(245, 239, 224, 0.08);
}

.admin__user-icon {
  color: var(--green-bright);
}

.admin__user strong {
  display: block;
  font-size: 0.8rem;
  line-height: 1.2;
}

.admin__user span {
  display: block;
  font-size: 0.68rem;
  color: var(--muted);
}

.admin__logout {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(232, 122, 93, 0.4);
  background: transparent;
  color: var(--coral);
  font-size: 0.78rem;
  font-weight: 700;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.admin__logout:hover {
  background: rgba(232, 122, 93, 0.14);
  color: #ffb3a0;
}

.admin__tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 0;
  scrollbar-width: none;
}

.admin__tabs::-webkit-scrollbar {
  display: none;
}

.admin__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 12px 18px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--muted);
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
}

.admin__tab:hover {
  color: var(--cream);
}

.admin__tab.is-active {
  color: var(--gold-light);
  border-bottom-color: var(--gold);
}

.admin__body {
  padding-block: 32px 64px;
}
</style>