import { onBeforeUnmount, onMounted, watch } from "vue";

// Trampa de foco para modales: confina Tab/Shift+Tab al contenedor, cierra
// con Escape y restaura el foco previo al desactivarse.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(containerRef, { active, onEscape }) {
  let previousFocus = null;

  function focusables() {
    const root = containerRef.value;
    if (!root) return [];
    return Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onEscape?.();
      return;
    }
    if (e.key !== "Tab") return;
    const els = focusables();
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  watch(active, (isActive, wasActive) => {
    if (isActive) {
      previousFocus = document.activeElement;
      (focusables()[0] || containerRef.value)?.focus();
    } else if (wasActive) {
      previousFocus?.focus?.();
      previousFocus = null;
    }
  });

  onMounted(() => document.addEventListener("keydown", onKeydown, true));
  onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown, true));
}