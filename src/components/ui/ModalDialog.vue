<script setup>
import { useTemplateRef } from "vue";
import { X } from "lucide-vue-next";
import { useFocusTrap } from "../../composables/useFocusTrap.js";

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
  ariaLabel: { type: String, default: "" },
  width: { type: String, default: "620px" },
});

const emit = defineEmits(["close"]);

const panelRef = useTemplateRef("panelRef");
useFocusTrap(panelRef, {
  active: () => props.open,
  onEscape: () => emit("close"),
});
</script>

<template>
  <Teleport to="body">
    <Transition name="adm-modal">
      <div v-if="open" class="adm-modal" role="dialog" aria-modal="true" :aria-label="ariaLabel || title" @click.self="emit('close')">
        <div ref="panelRef" class="adm-modal__panel" :style="{ width }">
          <div class="adm-modal__head">
            <h3>{{ title }}</h3>
            <button class="adm-icon-btn" type="button" aria-label="Cerrar" @click="emit('close')">
              <X :size="18" />
            </button>
          </div>
          <slot />
          <div v-if="$slots.footer" class="adm-modal__foot">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>