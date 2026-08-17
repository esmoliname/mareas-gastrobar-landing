// Analítica ligera de eventos (Google Analytics 4 vía gtag.js).
// El script de gtag solo se inyecta si existe VITE_GA_ID; sin él, track()
// es un no-op silencioso (el sitio funciona sin analítica).
const GA_ID = import.meta.env.VITE_GA_ID || "";
let gtagInjected = false;

function ensureGtag() {
  if (!GA_ID || gtagInjected || window.gtag) return;
  gtagInjected = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export function track(eventName, params = {}) {
  ensureGtag();
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

// Evita duplicar eventos rápidos (p. ej. cambios rápidos de modelo).
export function trackDebounced(eventName, params = {}, delay = 800) {
  trackDebounced.pending = trackDebounced.pending || new Map();
  const key = `${eventName}:${JSON.stringify(params)}`;
  clearTimeout(trackDebounced.pending.get(key));
  trackDebounced.pending.set(
    key,
    setTimeout(() => {
      trackDebounced.pending.delete(key);
      track(eventName, params);
    }, delay)
  );
}