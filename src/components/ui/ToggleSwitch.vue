<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  onLabel: { type: String, default: "Activo" },
  offLabel: { type: String, default: "Inactivo" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    class="adm-switch"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    :class="{ 'is-on': modelValue }"
    @click="toggle"
  >
    <span class="adm-switch__thumb" aria-hidden="true"></span>
    <span class="adm-switch__state">{{ modelValue ? onLabel : offLabel }}</span>
  </button>
</template>