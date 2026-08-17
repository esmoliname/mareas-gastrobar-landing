import { config } from "../config/index.js";

// Validadores y sanitizadores reutilizables del formulario admin.
// Toda entrada del panel pasa por aquí antes de persistirse en el catálogo.

export const LIMITS = {
  name: config.businessRules.maxNameLength,
  description: config.businessRules.maxDescriptionLength,
  priceMax: 1000000,
  tableDigits: String(config.businessRules.maxTableNumber).length,
};

export function sanitizeText(value, max = 280) {
  return String(value || "").trim().slice(0, max);
}

export function sanitizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, window.location.origin);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (url.username || url.password) return "";
    return url.href;
  } catch {
    return "";
  }
}

export function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => sanitizeText(t, 24))
    .filter(Boolean)
    .slice(0, 4);
}

export function sanitizeDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, LIMITS.tableDigits);
}

export const validators = {
  required: (value) => (String(value || "").trim() ? "" : "Este campo es obligatorio."),
  minLength: (min) => (value) =>
    String(value || "").trim().length >= min ? "" : `Debe tener al menos ${min} caracteres.`,
  maxLength: (max) => (value) =>
    String(value || "").length <= max ? "" : `No puede superar ${max} caracteres.`,
  numberMin: (min) => (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= min ? "" : `Debe ser un número mayor o igual a ${min}.`;
  },
  numberRange: (min, max) => (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "Ingresá un número válido.";
    if (n < min) return `Debe ser mayor o igual a ${min}.`;
    if (n > max) return `No puede superar ${max}.`;
    return "";
  },
  httpUrl: (optional = false) => (value) => {
    const raw = String(value || "").trim();
    if (!raw) return optional ? "" : "Ingresá una URL.";
    try {
      const url = new URL(raw, window.location.origin);
      if (!["http:", "https:"].includes(url.protocol)) return "Solo se permiten URLs http/https.";
      if (url.username || url.password) return "La URL no puede incluir credenciales.";
      return "";
    } catch {
      return "La URL no es válida.";
    }
  },
};

// Convierte reglas abreviadas ("required|maxLength:80|numberRange:1,1000000")
// en la lista de funciones equivalente.
const RULE_PARSERS = {
  required: () => [validators.required],
  optional: () => [],
  minLength: (arg) => [validators.minLength(Number(arg))],
  maxLength: (arg) => [validators.maxLength(Number(arg))],
  numberMin: (arg) => [validators.numberMin(Number(arg))],
  numberRange: (arg) => {
    const [min, max] = String(arg).split(",").map(Number);
    return [validators.numberRange(min, max)];
  },
  httpUrl: (arg, opts) => [validators.httpUrl(Boolean(opts?.optional))],
};

function parseRuleString(rule) {
  const fns = [];
  const opts = { optional: false };
  for (const part of String(rule).split("|")) {
    const [name, ...args] = part.split(":");
    if (name === "optional") {
      opts.optional = true;
      continue;
    }
    const parser = RULE_PARSERS[name];
    if (!parser) continue;
    fns.push(...parser(args.join(":"), opts));
  }
  return fns;
}

// Valida un set de campos con reglas {campo: [fn, ...]} o strings abreviados.
// Devuelve {campo: error}.
export function validateFields(rules, values) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const fns = typeof rule === "string" ? parseRuleString(rule) : rule;
    for (const fn of fns) {
      const message = fn(values[field]);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}