import { reactive } from "vue";

let nextId = 1;

export const toasts = reactive([]);

export function notify(type, message, opts = {}) {
  const id = nextId++;
  const toast = {
    id,
    type: ["success", "error", "info"].includes(type) ? type : "info",
    message: String(message || ""),
    duration: opts.duration ?? 3600,
  };
  toasts.push(toast);
  if (toast.duration > 0) {
    setTimeout(() => dismiss(id), toast.duration);
  }
  return id;
}

export function dismiss(id) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) toasts.splice(index, 1);
}

export const notifySuccess = (message, opts) => notify("success", message, opts);
export const notifyError = (message, opts) => notify("error", message, opts);
export const notifyInfo = (message, opts) => notify("info", message, opts);