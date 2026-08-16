<script setup>
import { computed, onMounted, ref } from "vue";
import SiteHeader from "../components/SiteHeader.vue";
import HeroSection from "../components/HeroSection.vue";
import MenuSection from "../components/MenuSection.vue";
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

const status = computed(() => getStatus());
const showBanner = ref(false);

onMounted(() => {
  showBanner.value = settings.banner.enabled;
});
</script>

<template>
  <SiteHeader :status="status" />
  <div v-if="showBanner" class="season-banner" role="status">
    <span class="season-banner__leaf" aria-hidden="true">🌴</span>
    <span>{{ settings.banner.text }}</span>
  </div>
  <main>
    <HeroSection :status="status" />
    <MenuSection />
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
  font-size: 1rem;
}
</style>