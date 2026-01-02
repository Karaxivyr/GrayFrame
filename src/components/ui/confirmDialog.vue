<template>
  <base-modal v-model="open_" size="sm" :close-on-backdrop="true">
    <template #title>{{ title || "Confirm" }}</template>

    <div class="body">
      <p class="message">{{ message }}</p>
    </div>

    <template #footer>
      <button class="btn" @click="cancel">{{ cancelLabel || "Cancel" }}</button>
      <button
        class="btn"
        :class="{
          'btn--danger': kind === 'danger',
          'btn--primary': kind !== 'danger',
        }"
        @click="confirm"
      >
        {{ confirmLabel || "Confirm" }}
      </button>
    </template>
  </base-modal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseModal from "./baseModal.vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    kind?: "danger" | "default";
  }>(),
  {
    kind: "default",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "confirm"): void;
}>();

const open_ = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit("update:modelValue", v),
});

function cancel() {
  emit("update:modelValue", false);
}
function confirm() {
  emit("confirm");
  emit("update:modelValue", false);
}
</script>

<style scoped>
.body {
  padding: 0.25rem 0;
}
.message {
  margin: 0;
  line-height: 1.4;
}
</style>
