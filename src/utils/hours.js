const OPEN_MIN = 11 * 60; // 11:00
const CLOSE_MIN = 23 * 60 + 45; // 23:45
const EXTEND_DAYS = new Set([5, 6]); // viernes y sábado extienden a 00:45 del día siguiente

export function getStatus(now = new Date()) {
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  if ((day === 6 || day === 0) && mins < 45) {
    return { open: true, label: "Abierto ahora", note: "Hasta 12:45 a.m." };
  }

  const isOpen = mins >= OPEN_MIN && mins < CLOSE_MIN;
  return {
    open: isOpen,
    label: isOpen ? "Abierto ahora" : "Cerrado",
    note: isOpen ? "Hasta 11:45 p.m." : "Abrimos a las 11:00 a.m.",
  };
}