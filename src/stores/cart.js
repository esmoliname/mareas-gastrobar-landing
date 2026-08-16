import { defineStore } from "pinia";
import { config } from "../config/index.js";
import { storageGetJSON, storageSetJSON } from "../utils/storage.js";

const STORAGE_KEY = "mareas:cart:v1";

export const TAX_RATE = config.taxRate;
export const MAX_QTY_PER_ITEM = config.businessRules.maxQtyPerItem;

export const ORDER_TYPES = {
  mesa: { id: "mesa", label: "En Mesa", hint: "Número de mesa" },
  pickup: { id: "pickup", label: "Para Llevar", hint: "Hora de retiro" },
  express: { id: "express", label: "Domicilio", hint: "Dirección de entrega" },
};

export const PAYMENT_METHODS = {
  sinpe: { id: "sinpe", label: "SINPE Móvil", hint: "Te enviamos el número para el sinpe." },
  efectivo: { id: "efectivo", label: "Efectivo", hint: "Pagás al recibir tu orden." },
  tarjeta: { id: "tarjeta", label: "Tarjeta", hint: "Pos en el local o al entregar." },
};

const saved = storageGetJSON(STORAGE_KEY);

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: saved?.items || [],
    drawerOpen: false,
    orderType: saved?.orderType || "mesa",
    tableNumber: saved?.tableNumber || "",
    pickupTime: saved?.pickupTime || "",
    deliveryAddress: saved?.deliveryAddress || "",
    contactName: saved?.contactName || "",
    contactPhone: saved?.contactPhone || "",
    paymentMethod: saved?.paymentMethod || "sinpe",
    cashPaid: saved?.cashPaid || "",
    checkoutStep: "cart",
  }),

  getters: {
    count: (state) => state.items.reduce((acc, i) => acc + i.quantity, 0),
    subtotal: (state) => state.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    tax: (state) => state.subtotal * TAX_RATE,
    taxPercent: () => Math.round(TAX_RATE * 100),
    total: (state) => state.subtotal + state.tax,
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    persist() {
      const { items, orderType, tableNumber, pickupTime, deliveryAddress, contactName, contactPhone, paymentMethod, cashPaid } = this.$state;
      storageSetJSON(STORAGE_KEY, { items, orderType, tableNumber, pickupTime, deliveryAddress, contactName, contactPhone, paymentMethod, cashPaid });
    },

    addItem(item, quantity = 1) {
      const existing = this.items.find((i) => i.id === item.id);
      const qty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, Number(quantity) || 1));
      if (existing) {
        existing.quantity = Math.min(MAX_QTY_PER_ITEM, existing.quantity + qty);
      } else {
        this.items.push({
          id: item.id,
          name: item.name,
          price: Math.max(0, Number(item.price) || 0),
          image: item.image || "",
          quantity: qty,
          note: "",
        });
      }
      this.persist();
    },

    increment(id) {
      const item = this.items.find((i) => i.id === id);
      if (item && item.quantity < MAX_QTY_PER_ITEM) item.quantity += 1;
      this.persist();
    },

    decrement(id) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.quantity -= 1;
      if (item.quantity <= 0) this.items = this.items.filter((i) => i.id !== id);
      this.persist();
    },

    removeItem(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.persist();
    },

    setNote(id, note) {
      const item = this.items.find((i) => i.id === id);
      if (item) item.note = String(note || "").slice(0, config.businessRules.maxNoteLength);
      this.persist();
    },

    setTable(number) {
      const clean = String(number || "").replace(/\D/g, "").slice(0, 2);
      this.tableNumber = clean;
      this.orderType = "mesa";
      this.persist();
    },

    open() {
      this.drawerOpen = true;
      this.checkoutStep = "cart";
    },

    close() {
      this.drawerOpen = false;
      this.checkoutStep = "cart";
    },

    clear() {
      this.items = [];
      this.cashPaid = "";
      this.persist();
    },
  },
});