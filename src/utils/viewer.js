// Carga única y compartida del visor @google/model-viewer (~1 MB).
// Configura el decoder Draco self-hosted (public/vendor/draco/) para no
// depender de CDNs externos (evita fallos de CORS en iOS) y aprovecha el
// caché HTTP del sitio para modelos re-utilizados.
let viewerPromise = null;

export function loadViewer() {
  if (!viewerPromise) {
    viewerPromise = import("@google/model-viewer").then((mod) => {
      const cls = mod.ModelViewerElement;
      if (cls && !cls.dracoDecoderLocation) {
        cls.dracoDecoderLocation = "/vendor/draco/";
      }
      return mod;
    });
  }
  return viewerPromise;
}

// Preload del GLB del platillo destacado: calienta el caché del navegador
// para que el primer "Ver en RA" abra casi instantáneo.
export function preloadModel(url) {
  if (!url || !window.matchMedia("(pointer: coarse)").matches) return;
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "fetch";
  link.type = "model/gltf-binary";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}