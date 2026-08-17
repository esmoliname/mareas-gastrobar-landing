<script setup>
defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  label: { type: String, default: "Etiquetas" },
  hint: { type: String, default: "" },
  span2: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

function toggle(tag) {
  const next = modelValue.includes(tag)
    ? modelValue.filter((t) => t !== tag)
    : [...modelValue, tag];
  emit("update:modelValue", next);
}
</script>

<template>
  <div class="adm-field" :class="{ 'adm-field--span2': span2 }">
    <span class="adm-field__label">{{ label }}</span>
    <div class="adm-tags">
      <button
        v-for="tag in options"
        :key="tag"
        type="button"
        class="adm-tags__chip"
        :class="{ 'is-active': modelValue.includes(tag) }"
        :aria-pressed="modelValue.includes(tag)"
        @click="toggle(tag)"
      >
        {{ tag }}
      </button>
    </div>
    <small v-if="hint" class="adm-field__hint">{{ hint }}</small>
  </div>
</template>