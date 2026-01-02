<template>
  <div class="popup" :data-open="open ? '1' : '0'">
    <div class="popup__surface"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>();
</script>

<style scoped>
.popup {
  position: relative;
}
.popup__surface {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 220px;
  padding: 0.5rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-2);
  display: none;
}
.popup[data-open="1"] .popup__surface {
  display: block;
}
</style>
