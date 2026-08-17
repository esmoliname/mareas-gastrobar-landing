<script setup>
import { useId } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: "" },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
  span2: { type: Boolean, default: false },
});

const id = useId();
</script>

<template>
  <div class="adm-field" :class="{ 'adm-field--span2': span2, 'is-error': Boolean(error) }">
    <label :for="id">
      {{ label }}<span v-if="required" class="adm-field__req" aria-hidden="true"> *</span>
    </label>
    <slot :id="id" />
    <small v-if="error" class="adm-field__error" role="alert">
      {{ error }}
    </small>
    <small v-else-if="hint" class="adm-field__hint">{{ hint }}</small>
  </div>
</template>