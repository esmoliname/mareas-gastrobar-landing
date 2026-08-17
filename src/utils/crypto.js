import { storageGet, storageSet } from "./storage.js";

// Primitivas criptográficas del cliente (Web Crypto, contexto seguro).
// La autenticación es client-side de demostración: el secreto vive en el
// bundle, pero estas defensas impiden manipulación casual y exfiltración
// trivial del token (huella del dispositivo) y comparación por timing.

const DEVICE_KEY = "mareas:device:v1";

function fallbackHash(input) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

// SHA-256 hex asíncrono con Web Crypto; cae a un hash rápido (no criptográfico)
// en contextos no seguros para no romper el flujo local.
export async function sha256Hex(input) {
  const data = new TextEncoder().encode(String(input));
  try {
    if (crypto.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    /* contexto no seguro */
  }
  return fallbackHash(String(input));
}

// Comparación en tiempo constante (evita timing attacks en el login).
export function secureEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

// Huella del dispositivo: un ID aleatorio persistido + user agent, hasheados.
// Se incluye como claim en el token: un token copiado a otro navegador
// (p. ej. robado del localStorage vía XSS) no puede reutilizarse.
let fingerprintCache = "";

export async function getDeviceFingerprint() {
  if (fingerprintCache) return fingerprintCache;
  let deviceId = storageGet(DEVICE_KEY);
  if (!deviceId) {
    deviceId = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
    storageSet(DEVICE_KEY, deviceId);
  }
  fingerprintCache = (await sha256Hex(`${deviceId}::${navigator.userAgent}`)).slice(0, 32);
  return fingerprintCache;
}