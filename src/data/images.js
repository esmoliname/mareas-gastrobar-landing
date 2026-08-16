// Catálogo central de fotos de Mareas.
// Única fuente de verdad para imágenes del sitio: hero, secciones,
// fallbacks por categoría y red social. Reemplazar las URLs de Unsplash
// por fotografía real del local cuando esté disponible.

const U = (id, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const photos = {
  hero: U("photo-1514933651103-005eec06c04b", 1920),
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
    { url: U("photo-1559847844-5315695dadae", 600), alt: "Mariscos del día en Mareas", label: "Mariscos del día" },
    { url: U("photo-1552332386-f8dd00dc2f85", 600), alt: "Antojos de la casa", label: "Antojos" },
    { url: U("photo-1544145945-f90425340c7e", 600), alt: "Cóctel tropical en Mareas", label: "Cóctel de la casa" },
    { url: U("photo-1514933651103-005eec06c04b", 600), alt: "Ambiente nocturno del bar", label: "Noches de Mareas" },
    { url: U("photo-1513104890138-7c749659a591", 600), alt: "Pizza recién salida del horno", label: "Pizza al horno" },
    { url: U("photo-1510812431401-41d2bd2722f3", 600), alt: "Brindis en Mareas", label: "Cheers" },
  ],
};