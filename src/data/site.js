import { config } from "../config/index.js";
import { buildWhatsappUrl } from "../services/whatsapp.js";

export const site = {
  brand: "Mareas | Gastrobar Tropical",
  tagline: "Comida, cócteles y buena vibra. Tropical, relajado y sin prisa.",

  phoneDisplay: config.contact.phoneDisplay,
  phoneTel: config.contact.phoneTel,
  whatsappNumber: config.contact.whatsappNumber,
  whatsappMessage: "¡Hola Mareas! Quiero reservar una mesa para hoy. 🌴",
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
    { id: "experiencias", emoji: "🎉", title: "Experiencias", desc: "Noches de buena vibra y eventos que se quedan en la memoria." },
    { id: "cocteles", emoji: "🍹", title: "Cócteles", desc: "Tragos tropicales para bajar el ritmo y quedarte un rato más." },
    { id: "pizza", emoji: "🍕", title: "Pizza", desc: "Recién salida, para compartir mesa y charla." },
    { id: "antojos", emoji: "🌮", title: "Antojos", desc: "Eso que antoja a media tarde y se pide para repetir." },
    { id: "cheers", emoji: "🥂", title: "Cheers", desc: "Brindis, grupo y actitud de escapada tropical." },
  ],

  hours: [
    { day: "Lunes", open: "11:00", close: "23:30" },
    { day: "Martes", open: "11:00", close: "23:30" },
    { day: "Miércoles", open: "11:00", close: "23:30" },
    { day: "Jueves", open: "11:00", close: "23:30" },
    { day: "Viernes", open: "11:00", close: "00:45" },
    { day: "Sábado", open: "11:00", close: "00:45" },
    { day: "Domingo", open: "11:00", close: "23:30" },
  ],

  testimonials: [
    { name: "Mariela R.", text: "El ambiente es otro nivel, te sentís de vacaciones sin salir de la ciudad." },
    { name: "Andrés C.", text: "Cócteles buenísimos y la pizza para repetir. Mejor plan de fin de semana en Quesada." },
    { name: "Valeria S.", text: "Relajado, buena música y atención cálida. Ya es nuestro lugar." },
  ],
};

export const whatsappUrl = (message = site.whatsappMessage) => buildWhatsappUrl(message);