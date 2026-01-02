<template>
  <div class="container">
    <div class="grid">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.grid {
  --grid-col-min: var(--grid-col-min);
  --grid-row: var(--grid-row);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-col-min), 1fr));
  grid-auto-rows: var(--grid-row);
  gap: 1.1rem;
}

/* Row spans driven by baseModule size classes */
:deep(.mod--s) {
  grid-row: span 2;
}
:deep(.mod--m) {
  grid-row: span 3;
}
:deep(.mod--l) {
  grid-row: span 4;
}

/* Orientation markers available for child CSS if desired */
:deep(.mod--v) {
  --mod-orientation: vertical;
}
:deep(.mod--h) {
  --mod-orientation: horizontal;
}
</style>
