// Acceso seguro a almacenamiento del navegador.
// Envuelve localStorage/sessionStorage en try/catch y provee un fallback en memoria
// para modo incógnito, cuotas excedidas o almacenamiento bloqueado.

const memory = new Map();

function readStore(getItem, key) {
  try {
    const raw = getItem(key);
    if (raw !== null && raw !== undefined) return raw;
  } catch {
    /* almacenamiento no disponible */
  }
  return null;
}

function writeStore(setItem, key, value) {
  try {
    setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageGet(key, { session = false } = {}) {
  if (!session) {
    const raw = readStore((k) => window.localStorage.getItem(k), key);
    if (raw !== null) return raw;
  }
  const raw = readStore((k) => window.sessionStorage.getItem(k), key);
  if (raw !== null) return raw;
  return memory.has(key) ? memory.get(key) : null;
}

export function storageSet(key, value, { session = false } = {}) {
  memory.set(key, value);
  if (session) {
    writeStore((k, v) => window.sessionStorage.setItem(k, v), key, value);
  } else if (!writeStore((k, v) => window.localStorage.setItem(k, v), key, value)) {
    writeStore((k, v) => window.sessionStorage.setItem(k, v), key, value);
  }
}

export function storageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* almacenamiento no disponible */
  }
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* almacenamiento no disponible */
  }
  memory.delete(key);
}

export function storageGetJSON(key, { session = false } = {}) {
  const raw = storageGet(key, { session });
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storageSetJSON(key, value, { session = false } = {}) {
  storageSet(key, JSON.stringify(value), { session });
}