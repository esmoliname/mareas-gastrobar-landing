<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from "vue";
import { Search, ScanLine, Box, X, UtensilsCrossed } from "lucide-vue-next";
import { catalog, menuCategories } from "../stores/catalog.js";
import { useCartStore } from "../stores/cart.js";
import { config } from "../config/index.js";
import DishCard from "./DishCard.vue";

const ArModal = defineAsyncComponent(() => import("./ArModal.vue"));

const cart = useCartStore();
const query = ref("");
const activeCategory = ref("Todos");
const tableFromUrl = ref("");

const chips = computed(() => ["Todos", ...menuCategories]);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return catalog.items.filter((item) => {
    if (!item.available) return false;
    if (activeCategory.value !== "Todos" && item.category !== activeCategory.value) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });
});

const arItem = ref(null);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const mesa = String(params.get("mesa") || "").trim();
  // Validación estricta: solo dígitos, 1–2 caracteres, dentro del rango de mesas.
  if (/^\d{1,2}$/.test(mesa)) {
    const n = Number(mesa);
    if (n >= 1 && n <= config.businessRules.maxTableNumber) {
      tableFromUrl.value = String(n);
      cart.setTable(String(n));
    }
  }
});

function clearTable() {
  tableFromUrl.value = "";
  cart.tableNumber = "";
}

function openAr(item) {
  arItem.value = item;
}

function closeAr() {
  arItem.value = null;
}
</script>

<template>
  <section id="menu" class="section menu">
    <div class="container">
      <div class="menu__head">
        <p class="eyebrow">Menú digital</p>
        <h2>Pedí lo que se antoja <span class="gold-italic">hoy</span></h2>
        <p class="menu__intro u-muted">
          Buscá tu platillo, tocá <strong>Ver en RA</strong> y proyectalo en tu espacio antes de pedirlo.
        </p>
      </div>

      <div class="menu__search" role="search">
        <Search :size="18" class="menu__search-icon" aria-hidden="true" />
        <input
          v-model="query"
          type="search"
          class="menu__input"
          placeholder="Buscá tacos, cócteles, pizza, ceviche…"
          aria-label="Buscar en el menú"
          autocomplete="off"
        />
        <span v-if="query" class="menu__count">{{ filtered.length }} resultado{{ filtered.length === 1 ? "" : "s" }}</span>
      </div>

      <div v-if="tableFromUrl" class="menu__table-chip" role="status">
        <UtensilsCrossed :size="15" aria-hidden="true" />
        <span>Escaneaste el QR de la <strong>Mesa {{ tableFromUrl }}</strong> — tu pedido se enviará a esa mesa.</span>
        <button type="button" aria-label="Quitar selección de mesa" @click="clearTable">
          <X :size="14" />
        </button>
      </div>

      <div class="menu__chips" role="tablist" aria-label="Categorías del menú">
        <button
          v-for="chip in chips"
          :key="chip"
          class="menu__chip"
          :class="{ 'is-active': activeCategory === chip }"
          role="tab"
          :aria-selected="activeCategory === chip"
          @click="activeCategory = chip"
        >
          {{ chip }}
        </button>
      </div>

      <p v-if="!filtered.length" class="menu__empty">
        <Box :size="28" aria-hidden="true" />
        Sin resultados para “{{ query }}”. Probá con otra búsqueda o cambiá de categoría.
      </p>

      <div v-else class="menu__grid">
        <DishCard v-for="item in filtered" :key="item.id" :item="item" @open-ar="openAr" />
      </div>

      <p class="menu__note">
        <ScanLine :size="15" aria-hidden="true" />
        Precios en colones. ¿Dudas? Reservá por WhatsApp y te confirmamos disponibilidad.
      </p>
    </div>

    <ArModal :item="arItem" @close="closeAr" />
  </section>
</template>

<style scoped>
.menu {
  scroll-margin-top: calc(var(--header-h) + 8px);
}

.menu__head {
  text-align: center;
  max-width: 560px;
  margin-inline: auto;
  margin-bottom: 28px;
}

.menu__head .eyebrow {
  justify-content: center;
}

.menu__head .eyebrow::before {
  display: none;
}

.menu__intro {
  margin-top: 10px;
}

.menu__search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 560px;
  margin-inline: auto;
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.14);
  transition: border-color 0.2s ease;
}

.menu__search:focus-within {
  border-color: var(--gold);
}

.menu__search-icon {
  color: var(--muted);
  flex-shrink: 0;
}

.menu__input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--cream);
  font: inherit;
  padding-block: 10px;
}

.menu__input::placeholder {
  color: var(--muted);
}

.menu__count {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gold);
  white-space: nowrap;
}

.menu__chips {
  display: flex;
  gap: 10px;
  margin: 22px auto 30px;
  max-width: 100%;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: none;
  justify-content: flex-start;
}

.menu__chips::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
.menu__table-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  max-width: 620px;
  margin: 14px auto 0;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.4);
  color: var(--sand);
  font-size: 0.8rem;
  text-align: center;
}

.menu__table-chip svg:first-child {
  color: var(--gold-light);
  flex-shrink: 0;
}

.menu__table-chip button {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 0;
  background: transparent;
  color: var(--muted);
  flex-shrink: 0;
}

.menu__table-chip button:hover {
  color: var(--gold-light);
}

.menu__chips {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.menu__chip {
  flex-shrink: 0;
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid rgba(245, 239, 224, 0.16);
  background: var(--bg-panel);
  color: var(--sand);
  font-size: 0.85rem;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.menu__chip:hover {
  border-color: var(--green-bright);
}

.menu__chip.is-active {
  background: linear-gradient(135deg, var(--green), var(--green-bright));
  border-color: transparent;
  color: #fff;
}

.menu__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
}

@media (min-width: 640px) {
  .menu__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .menu__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.menu__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 20px;
  text-align: center;
  color: var(--muted);
  border: 1px dashed rgba(245, 239, 224, 0.18);
  border-radius: var(--radius-lg);
}

.menu__note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
  font-size: 0.8rem;
  color: var(--muted);
  text-align: center;
}
</style>