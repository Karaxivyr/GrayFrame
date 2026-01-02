<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal"
      role="dialog"
      :aria-labelledby="id + '_title'"
      aria-modal="true"
      @keydown.esc.prevent="close"
    >
      <div class="modal__backdrop" @click="backdropClick" />

      <div class="modal__panel" :class="sizeClass">
        <header class="modal__header">
          <h2 :id="id + '_title'"><slot name="title">Dialog</slot></h2>
          <button class="iconbtn" @click="close" aria-label="Close">×</button>
        </header>

        <div class="modal__body">
          <slot />
        </div>

        <footer class="modal__footer" v-if="$slots.footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    size?: "sm" | "md" | "lg";
    closeOnBackdrop?: boolean;
  }>(),
  { size: "md", closeOnBackdrop: true }
);
const emit = defineEmits<{ (e: "update:modelValue", v: boolean): void }>();
const id = `m-${Math.random().toString(36).slice(2, 9)}`;
const sizeClass = `modal--${props.size}`;
function close() {
  emit("update:modelValue", false);
}
function backdropClick() {
  if (props.closeOnBackdrop) close();
}
function lockScroll(lock: boolean) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
onMounted(() => lockScroll(true));
onUnmounted(() => lockScroll(false));
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
}
.modal__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, black 50%, transparent);
  backdrop-filter: blur(2px);
}
.modal__panel {
  position: relative;
  width: min(920px, 92vw);
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 14px;
  box-shadow: var(--shadow-2, 0 10px 40px rgba(0, 0, 0, 0.45));
  overflow: hidden;
}
.modal--sm {
  width: min(520px, 92vw);
}
.modal--lg {
  width: min(1100px, 92vw);
}

/* add a hair more right padding for visual balance */
.modal__header,
.modal__body,
.modal__footer {
  padding-inline: 1rem 1.25rem;
}
.modal__header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding-block: 0.9rem 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
  background: color-mix(in srgb, var(--panel) 92%, var(--panel-subtle));
}
.modal__header h2 {
  margin: 0;
  font-size: var(--fs-2);
}

.iconbtn {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--panel);
  color: inherit;
  font: inherit;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.iconbtn:hover {
  background: color-mix(in srgb, var(--panel) 70%, var(--panel-subtle));
}
.modal__body {
  padding-block: 1rem;
}
.modal__footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;
  padding-block: 0.75rem;
  border-top: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
}
</style>
