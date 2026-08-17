import { ref } from "vue";

// Copia al portapapeles con fallback (execCommand) para contextos sin
// Permissions API. Expone un estado `copied` que se auto-resetea.
export function useClipboard(resetMs = 1600) {
  const copied = ref(false);
  let timer = null;

  async function copy(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(text));
      } else {
        const area = document.createElement("textarea");
        area.value = String(text);
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      copied.value = true;
      clearTimeout(timer);
      timer = setTimeout(() => (copied.value = false), resetMs);
      return true;
    } catch {
      return false;
    }
  }

  return { copied, copy };
}