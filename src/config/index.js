// Configuración centralizada de Mareas Gastrobar.
// Valores por defecto para desarrollo; sobrescribibles vía variables de entorno (VITE_*).
// Ver .env.example para la lista completa.

const env = import.meta.env;

export const config = {
  brand: {
    name: "Mareas",
    fullName: "Mareas Gastrobar Tropical",
    siteUrl: env.VITE_SITE_URL || "https://restaurantemareascr.com",
  },

  contact: {
    phoneDisplay: env.VITE_PHONE_DISPLAY || "+506 2460-9500",
    phoneTel: env.VITE_PHONE_TEL || "+50624609500",
    whatsappNumber: env.VITE_WHATSAPP_NUMBER || "50689779500",
    email: env.VITE_CONTACT_EMAIL || "empleos@mareascr.com",
  },

  // Reglas de negocio
  taxRate: 0.13, // IVA 13% Costa Rica
  hours: {
    open: "11:00",
    closeWeekday: "23:45",
    closeWeekend: "00:45", // viernes y sábado extienden hasta el día siguiente
    extendedDays: [5, 6], // 0=Dom … 6=Sáb
  },
  businessRules: {
    maxQtyPerItem: 20,
    maxTableNumber: 99,
    maxGuests: 20,
    maxReservationDaysAhead: 60,
    highFlowAfter: "20:30",
    maxNoteLength: 120,
    maxNameLength: 80,
    maxDescriptionLength: 280,
    authTtlMs: 8 * 60 * 60 * 1000, // sesión admin: 8 horas
  },

  admin: {
    username: env.VITE_ADMIN_USER || "admin",
    password: env.VITE_ADMIN_PASS || "mareas2024",
  },
};