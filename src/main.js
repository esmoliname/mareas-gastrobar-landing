import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index.js";
import { applyTheme } from "./stores/settings.js";
import { site } from "./data/site.js";
import { config } from "./config/index.js";
import { photos } from "./data/images.js";
import "./styles/main.css";
import "./styles/admin.css";

applyTheme();

// JSON-LD generado desde config/site: una sola fuente de verdad para
// horarios, contacto y datos del negocio (SEO escalable).
(function injectStructuredData() {
  const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const extended = config.hours.extendedDays;

  const specs = DAYS_EN.map((day, i) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: day,
    opens: config.hours.open,
    closes: extended.includes(i) ? "23:59" : config.hours.closeWeekday,
  }));

  // Madrugada tras viernes y sábado (hasta 00:45 del día siguiente).
  extended.forEach((d) => {
    specs.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS_EN[(d + 1) % 7],
      opens: "00:00",
      closes: config.hours.closeWeekend,
    });
  });

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: config.brand.fullName,
    alternateName: config.brand.name,
    description: "Bar-restaurante con ambiente de playa en Ciudad Quesada, San Carlos. Comida, cócteles y buena vibra. Tropical, relajado y sin prisa.",
    url: config.brand.siteUrl,
    telephone: `+${config.contact.phoneTel.replace(/\D/g, "")}`,
    email: config.contact.email,
    priceRange: "$$",
    servesCuisine: ["Cocina tropical", "Pizza", "Cócteles", "Antojos"],
    image: [photos.og],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.addressLine1,
      addressLocality: "Ciudad Quesada",
      addressRegion: "San Carlos",
      postalCode: "21001",
      addressCountry: "CR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 10.318, longitude: -84.4286 },
    openingHoursSpecification: specs,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(site.rating.value),
      reviewCount: String(site.rating.count).replace(/\D/g, ""),
      bestRating: "5",
    },
    sameAs: [site.instagram, site.facebook, site.tripadvisor],
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
})();

createApp(App).use(createPinia()).use(router).mount("#app");