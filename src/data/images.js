// Catálogo central de fotos de Mareas.
// Única fuente de verdad para imágenes del sitio: hero, secciones,
// fallbacks por categoría y red social.
//
// Las fotos /photos/*.jpg fueron descargadas de la página oficial de
// Facebook de Mareas (facebook.com/Mareascr) el 2026-08-16 y optimizadas
// para web (los enlaces originales de fbcdn expiran, por eso viven en el repo).

const U = (id, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const photos = {
  hero: "/photos/hero.jpg",
  // og:image requiere URL absoluta estable; se mantiene en Unsplash hasta
  // que restaurantemareascr.com esté en línea con fotos del local.
  og: U("photo-1514933651103-005eec06c04b", 1200),

  highlights: {
    experiencias: U("photo-1514525253161-7a46d19cd819"),
    cocteles: U("photo-1544145945-f90425340c7e"),
    pizza: U("photo-1513104890138-7c749659a591"),
    antojos: U("photo-1552332386-f8dd00dc2f85"),
    cheers: U("photo-1510812431401-41d2bd2722f3"),
  },

  experience: {
    sunset: U("photo-1507525428034-b723cf961d3e"),
    cocktail: U("photo-1551024709-8f23befc6f87"),
    pizza: U("photo-1574071318508-1cdbab80d002"),
  },

  // Foto de respaldo cuando un platillo no tiene imagen o falla su carga.
  category: {
    Pizzas: U("photo-1513104890138-7c749659a591"),
    Cócteles: U("photo-1544145945-f90425340c7e"),
    Mariscos: U("photo-1559847844-5315695dadae"),
    Antojos: U("photo-1568901346375-23c9450c58cd"),
    Experiencias: U("photo-1514525253161-7a46d19cd819"),
  },

  social: [
    { url: "/photos/g1.jpg", alt: "Fotos reales de Mareas — noche en el gastrobar", label: "Noche en Mareas" },
    { url: "/photos/g2.jpg", alt: "Fotos reales de Mareas Gastrobar", label: "Mareas Gastrobar" },
    { url: "/photos/g3.jpg", alt: "Fotos reales de Mareas — la casa", label: "La casa de Mareas" },
    { url: "/photos/g4.jpg", alt: "Fotos reales de Mareas — Ciudad Quesada", label: "Ciudad Quesada" },
    { url: "/photos/g5.jpg", alt: "Fotos reales de Mareas — fines de semana", label: "Fines de semana" },
    { url: "/photos/g6.jpg", alt: "Fotos reales de Mareas — noche de gastrobar", label: "Noches de Mareas" },
  ],
};