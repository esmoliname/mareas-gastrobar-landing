import { defineStore } from "pinia";
import { storageGetJSON, storageSetJSON } from "../utils/storage.js";

export const RESERVATION_LOG_KEY = "mareas:reservations:v1";

export const useReservationStore = defineStore("reservations", {
  state: () => ({
    log: storageGetJSON(RESERVATION_LOG_KEY) || [],
    lastSaved: null,
  }),

  actions: {
    register(entry) {
      const record = { id: `res-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), ...entry };
      this.log.unshift(record);
      this.lastSaved = record;
      storageSetJSON(RESERVATION_LOG_KEY, this.log.slice(0, 200));
      return record;
    },
  },
});