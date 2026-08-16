import { defineStore } from "pinia";
import { config } from "../config/index.js";
import { storageGet, storageGetJSON, storageRemove, storageSet, storageSetJSON } from "../utils/storage.js";

const STORAGE_KEY = "mareas:auth:v1";

const DEMO_USER = {
  id: "usr-admin-001",
  username: config.admin.username,
  name: "Administración Mareas",
  role: "owner",
};

// Firma HMAC-SHA256 con Web Crypto (crypto.subtle).
// Disponible en contextos seguros (https / localhost). El secreto vive en el bundle
// por ser autenticación client-side de demostración, pero impide manipulación casual
// del token (p. ej. extender el `exp`) desde la consola o el storage.

const b64urlFromBytes = (buf) => {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const b64urlFromString = (str) =>
  btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const b64urlToString = (part) => {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bytes = atob(padded);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes.charCodeAt(i) & 0xff);
  return decodeURIComponent(escape(bin));
};

function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`mareas-hmac::${config.admin.username}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function signData(input) {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return b64urlFromBytes(sig);
}

function parseToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  try {
    const payload = JSON.parse(b64urlToString(payloadB64));
    if (!payload || typeof payload.exp !== "number") return null;
    return { headerB64, payloadB64, sigB64, payload };
  } catch {
    return null;
  }
}

async function verifyToken(token) {
  const parsed = parseToken(token);
  if (!parsed) return null;
  const expected = await signData(`${parsed.headerB64}.${parsed.payloadB64}`);
  if (expected !== parsed.sigB64) return null;
  if (parsed.payload.exp * 1000 <= Date.now()) return null;
  return parsed.payload;
}

function issueToken(user, ttlMs) {
  const now = Date.now();
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    iss: "mareas-local",
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ttlMs) / 1000),
  };
  return signData(`${b64urlFromString(JSON.stringify(header))}.${b64urlFromString(JSON.stringify(payload))}`).then(
    (sig) => `${b64urlFromString(JSON.stringify(header))}.${b64urlFromString(JSON.stringify(payload))}.${sig}`
  );
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    displayName: (state) => state.user?.name || "Administrador",
  },

  actions: {
    // Verifica firma y expiración del token persistido. Se invoca en cada navegación
    // protegida y al arrancar la app.
    async ensureValidSession() {
      if (this.token) {
        if (await verifyToken(this.token)) return;
        this.clearSession();
        storageRemove(STORAGE_KEY);
        return;
      }
      const stored = storageGetJSON(STORAGE_KEY);
      if (!stored?.token) return;
      const payload = await verifyToken(stored.token);
      if (!payload) {
        storageRemove(STORAGE_KEY);
        return;
      }
      this.user = stored.user || { ...DEMO_USER };
      this.token = stored.token;
    },

    async login(username, password, remember = true) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 650));
        const okUser = String(username || "").trim().toLowerCase();
        const okPass = String(password || "");
        if (okUser !== config.admin.username || okPass !== config.admin.password) {
          throw new Error("Credenciales incorrectas. Verificá usuario y contraseña.");
        }
        this.user = { ...DEMO_USER };
        this.token = await issueToken(this.user, config.businessRules.authTtlMs);
        const payload = { user: this.user, token: this.token };
        if (remember) {
          storageSetJSON(STORAGE_KEY, payload);
        } else {
          storageSetJSON(STORAGE_KEY, payload, { session: true });
        }
        return true;
      } finally {
        this.loading = false;
      }
    },

    clearSession() {
      this.user = null;
      this.token = null;
    },

    logout() {
      this.clearSession();
      storageRemove(STORAGE_KEY);
    },
  },
});