import { config } from "../config/index.js";

export const WHATSAPP_NUMBER = String(config.contact.whatsappNumber || "").replace(/\D/g, "");

export function buildWhatsappUrl(message) {
  const text = encodeURIComponent(String(message || ""));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}