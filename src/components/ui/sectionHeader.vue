<template>
  <div class="modHeader">
    <div class="modHeader__title">
      <span v-if="icon" class="modHeader__icon" aria-hidden="true">{{
        icon
      }}</span>
      <h2 class="modHeader__text">{{ title }}</h2>
      <div class="modHeader__meta"><slot name="meta" /></div>
    </div>
    <div class="modHeader__actions"><slot name="actions" /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; icon?: string | null }>();
</script>

<style scoped>
.modHeader {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
}
.modHeader__title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.modHeader__icon {
  opacity: 0.75;
}
.modHeader__text {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
}
.modHeader__meta {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  opacity: 0.75;
}
.modHeader__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
