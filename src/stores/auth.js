import { defineStore } from "pinia";
import { config } from "../config/index.js";
import { sha256Hex, secureEqual, getDeviceFingerprint } from "../utils/crypto.js";
import { audit } from "../utils/audit.js";
import { storageGetJSON, storageRemove, storageSetJSON } from "../utils/storage.js";

const STORAGE_KEY = "mareas:auth:v1";
const LOCKOUT_KEY = "mareas:auth:lockout:v1";

const DEMO_USER = {
  id: "usr-admin-001",
  username: config.admin.username,
  name: "Administración Mareas",
  role: "owner",
};

// Escalones de bloqueo exponencial (segundos) tras intentos fallidos.
const LOCKOUT_STEPS = [0, 0, 30, 60, 120, 600];

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
  if (!secureEqual(expected, parsed.sigB64)) return null;
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
    // Huella del dispositivo: un token copiado a otro navegador no sirve.
    fp: getDeviceFingerprint(),
  };
  const body = `${b64urlFromString(JSON.stringify(header))}.${b64urlFromString(JSON.stringify(payload))}`;
  return signData(body).then((sig) => `${body}.${sig}`);
}

// Bloqueo por intentos fallidos persistido en sessionStorage: sobrevive
// recargas de la pestaña pero no a cerrar el navegador.
function loadLockout() {
  const stored = storageGetJSON(LOCKOUT_KEY);
  if (!stored) return { failedAttempts: 0, lockedUntil: 0 };
  return {
    failedAttempts: Number(stored.failedAttempts) || 0,
    lockedUntil: Number(stored.lockedUntil) || 0,
  };
}

function saveLockout(state) {
  storageSetJSON(LOCKOUT_KEY, { failedAttempts: state.failedAttempts, lockedUntil: state.lockedUntil });
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    failedAttempts: loadLockout().failedAttempts,
    lockedUntil: loadLockout().lockedUntil,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    displayName: (state) => state.user?.name || "Administrador",
  },

  actions: {
    // Verifica firma, expiración y huella de dispositivo del token persistido.
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
      if (!payload || payload.fp !== getDeviceFingerprint()) {
        storageRemove(STORAGE_KEY);
        return;
      }
      this.user = stored.user || { ...DEMO_USER };
      this.token = stored.token;
    },

    async login(username, password, remember = true) {
      this.loading = true;
      try {
        const { failedAttempts, lockedUntil } = loadLockout();
        this.failedAttempts = failedAttempts;
        this.lockedUntil = lockedUntil;

        const waitMs = this.lockedUntil - Date.now();
        if (waitMs > 0) {
          throw new Error(`Demasiados intentos fallidos. Esperá ${Math.ceil(waitMs / 1000)} segundos e intentá de nuevo.`);
        }
        if (!config.admin.configured) {
          throw new Error("El panel aún no está configurado. Definí la variable VITE_ADMIN_PASS para habilitar el acceso.");
        }
        await new Promise((resolve) => setTimeout(resolve, 650));

        const okUser = String(username || "").trim().toLowerCase();
        const okPass = String(password || "");
        // Comparación de hashes en tiempo constante; nunca se compara la
        // contraseña plana contra el valor de referencia en memoria.
        const [refHash, givenHash] = await Promise.all([
          sha256Hex(`${okUser}::${okPass}`),
          sha256Hex(`${config.admin.username}::${config.admin.password}`),
        ]);
        if (!secureEqual(refHash, givenHash)) {
          this.failedAttempts += 1;
          const step = Math.min(this.failedAttempts, LOCKOUT_STEPS.length - 1);
          if (LOCKOUT_STEPS[step] > 0) {
            this.lockedUntil = Date.now() + LOCKOUT_STEPS[step] * 1000;
            this.failedAttempts = 0;
            saveLockout(this);
            audit("auth.lockout", `bloqueo ${LOCKOUT_STEPS[step]} s`);
            throw new Error(`Demasiados intentos fallidos. Esperá ${LOCKOUT_STEPS[step]} segundos e intentá de nuevo.`);
          }
          saveLockout(this);
          audit("auth.login_fail", `usuario “${okUser}”`);
          throw new Error("Credenciales incorrectas. Verificá usuario y contraseña.");
        }

        this.failedAttempts = 0;
        saveLockout(this);
        this.user = { ...DEMO_USER };
        this.token = await issueToken(this.user, config.businessRules.authTtlMs);
        const payload = { user: this.user, token: this.token };
        storageSetJSON(STORAGE_KEY, payload, remember ? {} : { session: true });
        audit("auth.login", `usuario “${config.admin.username}”`);
        return true;
      } finally {
        this.loading = false;
      }
    },

    clearSession() {
      this.user = null;
      this.token = null;
    },

    // reason: "manual" | "auto" (inactividad) — queda registrado en la bitácora.
    logout(reason = "manual") {
      audit("auth.logout", reason === "auto" ? "por inactividad" : "manual");
      this.clearSession();
      storageRemove(STORAGE_KEY);
    },
  },
});