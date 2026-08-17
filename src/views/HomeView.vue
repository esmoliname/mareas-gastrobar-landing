<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from "vue";
import { Palmtree } from "lucide-vue-next";
import SiteHeader from "../components/SiteHeader.vue";
import HeroSection from "../components/HeroSection.vue";
import MenuSection from "../components/MenuSection.vue";
import ArGallerySection from "../components/ArGallerySection.vue";
import CategoryTicker from "../components/CategoryTicker.vue";
import HighlightsSection from "../components/HighlightsSection.vue";
import ExperienceSection from "../components/ExperienceSection.vue";
import SocialProofSection from "../components/SocialProofSection.vue";
import SocialFeed from "../components/SocialFeed.vue";
import LocationSection from "../components/LocationSection.vue";
import ReservationSection from "../components/ReservationSection.vue";
import FinalCtaSection from "../components/FinalCtaSection.vue";
import SiteFooter from "../components/SiteFooter.vue";
import WhatsappFab from "../components/WhatsappFab.vue";
import CartDrawer from "../components/CartDrawer.vue";
import { getStatus } from "../utils/hours.js";
import { settings } from "../stores/settings.js";
import { catalog } from "../stores/catalog.js";
import { arStore } from "../stores/ar.js";
import { modelCatalog } from "../data/models3d.js";
import { preloadModel } from "../utils/viewer.js";

// El visor 3D/AR se monta una sola vez y se comparte con el menú y la galería.
const ArModal = defineAsyncComponent(() => import("../components/ArModal.vue"));

const status = computed(() => getStatus());
const showBanner = ref(false);

// Platillo que abre el CTA del hero y se precarga para el primer "Ver en RA".
const featuredDish = computed(() => catalog.items.find((i) => i.id === "pizza-pacifico"));

function openFeaturedAr() {
  if (featuredDish.value) arStore.openItem(featuredDish.value, "hero");
}

onMounted(() => {
  showBanner.value = settings.banner.enabled;

  // Deep link: /?ra=<id-de-platillo|key-de-modelo> abre el visor 3D directo
  // (p. ej. desde una historia de Instagram o un QR del local).
  const ra = String(new URLSearchParams(window.location.search).get("ra") || "").trim();
  if (ra) {
    const dish =
      catalog.items.find((i) => i.id === ra) ||
      catalog.items.find((i) => i.model === modelCatalog[ra]?.glb);
    if (dish && dish.available) arStore.openItem(dish, "deep_link");
  }

  if (featuredDish.value?.model) preloadModel(featuredDish.value.model);
});
</script>

<template>
  <SiteHeader :status="status" />
  <div v-if="showBanner" class="season-banner" role="status">
    <span class="season-banner__leaf" aria-hidden="true"><Palmtree :size="16" /></span>
    <span>{{ settings.banner.text }}</span>
  </div>
  <main>
    <HeroSection :status="status" :featured-dish="featuredDish" @open-ar="openFeaturedAr" />
    <MenuSection />
    <ArGallerySection />
    <CategoryTicker />
    <HighlightsSection />
    <ExperienceSection />
    <SocialProofSection />
    <SocialFeed />
    <LocationSection :status="status" />
    <ReservationSection />
    <FinalCtaSection />
  </main>
  <SiteFooter />
  <WhatsappFab />
  <CartDrawer />
  <ArModal />
</template>

<style scoped>
.season-banner {
  position: sticky;
  top: var(--header-h);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(90deg, var(--green), #12301f 40%, var(--green));
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid rgba(201, 162, 39, 0.4);
}

.season-banner__leaf {
  display: inline-flex;
  color: var(--green-bright);
}
</style>