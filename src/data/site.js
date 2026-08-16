import { config } from "../config/index.js";
import { buildWhatsappUrl } from "../services/whatsapp.js";
import { photos } from "./images.js";

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const site = {
  brand: "Mareas | Gastrobar Tropical",
  tagline: "Comida, cócteles y buena vibra. Tropical, relajado y sin prisa.",

  phoneDisplay: config.contact.phoneDisplay,
  phoneTel: config.contact.phoneTel,
  whatsappNumber: config.contact.whatsappNumber,
  whatsappMessage: "¡Hola Mareas! Quiero reservar una mesa para hoy.",
  email: config.contact.email,

  instagram: "https://www.instagram.com/mareas.cr",
  instagramHandle: "@mareas.cr",
  facebook: "https://www.facebook.com/Mareascr",
  tripadvisor:
    "https://www.tripadvisor.es/Restaurant_Review-g608636-d23675928-Reviews-Mareas-Quesada_Province_of_Alajuela.html",
  googleReviews: "https://www.google.com/maps/search/?api=1&query=Mareas+Gastrobar+Tropical+Ciudad+Quesada",

  mapsLink: "https://www.google.com/maps/search/?api=1&query=10.3180,-84.4286",
  wazeLink: "https://waze.com/ul?ll=10.3180,-84.4286&navigate=yes",
  mapsEmbed: "https://maps.google.com/maps?q=10.318,-84.4286&z=15&hl=es&output=embed",

  addressLine1: "400 mts Sur del INA",
  addressLine2: "Barrio Lourdes, Ciudad Quesada, San Carlos, 21001",

  rating: { value: 4.4, count: "900+", source: "Google" },

  highlights: [
    { id: "experiencias", photo: photos.highlights.experiencias, title: "Experiencias", desc: "Noches de buena vibra y eventos que se quedan en la memoria." },
    { id: "cocteles", photo: photos.highlights.cocteles, title: "Cócteles", desc: "Tragos tropicales para bajar el ritmo y quedarte un rato más." },
    { id: "pizza", photo: photos.highlights.pizza, title: "Pizza", desc: "Recién salida, para compartir mesa y charla." },
    { id: "antojos", photo: photos.highlights.antojos, title: "Antojos", desc: "Eso que antoja a media tarde y se pide para repetir." },
    { id: "cheers", photo: photos.highlights.cheers, title: "Cheers", desc: "Brindis, grupo y actitud de escapada tropical." },
  ],

  // Derivado de config.hours: una sola fuente de verdad para horarios.
  hours: DAY_NAMES.map((day, i) => ({
    day,
    open: config.hours.open,
    close: config.hours.extendedDays.includes(i) ? config.hours.closeWeekend : config.hours.closeWeekday,
  })),

  testimonials: [
    { name: "Mariela R.", text: "El ambiente es otro nivel, te sentís de vacaciones sin salir de la ciudad." },
    { name: "Andrés C.", text: "Cócteles buenísimos y la pizza para repetir. Mejor plan de fin de semana en Quesada." },
    { name: "Valeria S.", text: "Relajado, buena música y atención cálida. Ya es nuestro lugar." },
  ],
};

export const whatsappUrl = (message = site.whatsappMessage) => buildWhatsappUrl(message);