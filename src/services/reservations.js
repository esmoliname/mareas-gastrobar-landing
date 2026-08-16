import { buildWhatsappUrl } from "./whatsapp.js";

const BAR = "─────────────────────";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

export function buildReservationMessage(data) {
  const lines = [];
  lines.push("🌴 *RESERVA DE MESA — MAREAS* 🌴");
  lines.push(BAR);
  lines.push(`👤 Nombre: ${data.name || "—"}`);
  lines.push(`📱 Teléfono: ${data.phone || "—"}`);
  lines.push(`👥 Comensales: ${data.guests || "—"}`);
  lines.push(`📅 Fecha: ${formatDate(data.date)}`);
  lines.push(`⏰ Hora: ${data.time || "—"}`);
  if (data.notes) lines.push(`📝 Notas: ${data.notes}`);
  lines.push(BAR);
  lines.push("¡Nos vemos pronto! 🍹");
  return lines.join("\n");
}

export function reservationWhatsappUrl(data) {
  return buildWhatsappUrl(buildReservationMessage(data));
}