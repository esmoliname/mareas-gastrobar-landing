import { formatColones } from "../utils/format.js";
import { config } from "../config/index.js";
import { buildWhatsappUrl } from "./whatsapp.js";

const BAR = "─────────────────────";

function formatTimeForDisplay(time) {
  if (!time) return "—";
  const [h, m] = String(time).split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "p.m." : "a.m.";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m || "00"} ${suffix}`;
}

function orderTypeLabel(orderType) {
  const labels = {
    mesa: "En Mesa",
    pickup: "Para Llevar (Pick-up)",
    express: "Express / Domicilio",
  };
  return labels[orderType] || orderType;
}

export function buildOrderMessage(cart) {
  const lines = [];
  lines.push("🌴 *NUEVO PEDIDO — MAREAS* 🌴");
  lines.push(BAR);

  cart.items.forEach((item) => {
    const line = `• ${item.name} x${item.quantity} — ${formatColones(item.price * item.quantity)}`;
    lines.push(line);
    if (item.note && item.note.trim()) {
      lines.push(`   📝 Nota: ${item.note.trim()}`);
    }
  });

  lines.push(BAR);
  lines.push(`Subtotal: ${formatColones(cart.subtotal)}`);
  lines.push(`IVA (${Math.round(config.taxRate * 100)}%): ${formatColones(cart.tax)}`);
  lines.push(`💰 *TOTAL: ${formatColones(cart.total)}*`);
  lines.push(BAR);
  lines.push(`🍽️ Tipo de orden: *${orderTypeLabel(cart.orderType)}*`);

  if (cart.orderType === "mesa") {
    lines.push(`🪑 Mesa: *${cart.tableNumber || "por asignar"}*`);
  } else if (cart.orderType === "pickup") {
    lines.push(`⏰ Hora de retiro: *${formatTimeForDisplay(cart.pickupTime)}*`);
  } else if (cart.orderType === "express") {
    lines.push(`🏠 Dirección: *${cart.deliveryAddress || "por confirmar"}*`);
  }

  if (cart.contactName) lines.push(`👤 Nombre: ${cart.contactName}`);
  if (cart.contactPhone) lines.push(`📱 Teléfono: ${cart.contactPhone}`);
  lines.push(`💳 Pago: ${paymentLabel(cart.paymentMethod)}`);

  if (cart.paymentMethod === "efectivo" && cart.cashPaid) {
    lines.push(`💵 Pagás con: ${formatColones(cart.cashPaid)} (vuelto ${formatColones(Number(cart.cashPaid) - cart.total)})`);
  }

  lines.push(BAR);
  lines.push("¡Gracias! Los esperamos. 🍹");
  return lines.join("\n");
}

function paymentLabel(method) {
  const labels = { sinpe: "SINPE Móvil", efectivo: "Efectivo", tarjeta: "Tarjeta" };
  return labels[method] || method;
}

export function orderWhatsappUrl(cart) {
  return buildWhatsappUrl(buildOrderMessage(cart));
}