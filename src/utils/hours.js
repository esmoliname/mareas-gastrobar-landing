import { config } from "../config/index.js";

const OPEN_MIN = toMinutes(config.hours.open); // 11:00
const CLOSE_WEEKDAY_MIN = toMinutes(config.hours.closeWeekday); // 23:45
const CLOSE_WEEKEND_MIN = toMinutes(config.hours.closeWeekend); // 00:45 del día siguiente
const EXTEND_DAYS = new Set(config.hours.extendedDays); // viernes y sábado

export function toMinutes(time) {
  const [h, m] = String(time || "").split(":");
  return Number(h) * 60 + Number(m || "0");
}

export function getStatus(now = new Date()) {
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const prevDay = (day + 6) % 7;

  // Madrugada tras un día extendido: sábado y domingo antes de 12:45 a.m.
  const earlyOpen = EXTEND_DAYS.has(prevDay) && mins < CLOSE_WEEKEND_MIN;
  // Noche de viernes y sábado después de las 11:45 p.m. (hasta 12:45 a.m.)
  const lateOpen = EXTEND_DAYS.has(day) && mins >= CLOSE_WEEKDAY_MIN;

  const isOpen = earlyOpen || lateOpen || (mins >= OPEN_MIN && mins < CLOSE_WEEKDAY_MIN);

  if (earlyOpen || lateOpen) {
    return { open: true, label: "Abierto ahora", note: "Hasta 12:45 a.m." };
  }
  return {
    open: isOpen,
    label: isOpen ? "Abierto ahora" : "Cerrado",
    note: isOpen ? `Hasta las ${config.hours.closeWeekday} p.m.` : `Abrimos a las ${config.hours.open} a.m.`,
  };
}