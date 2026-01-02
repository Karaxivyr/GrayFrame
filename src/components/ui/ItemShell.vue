<template>
  <article class="item" :class="'item--' + variant" @click="$emit('click')">
    <div v-if="$slots.leading" class="item__leading">
      <slot name="leading" />
    </div>
    <div class="item__content"><slot /></div>
    <div v-if="$slots.meta" class="item__meta"><slot name="meta" /></div>
    <div v-if="$slots.actions" class="item__actions">
      <slot name="actions" />
    </div>
  </article>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: "row" | "card" | "chip" }>(), {
  variant: "row",
});
defineEmits<{ (e: "click"): void }>();
</script>

<style scoped>
/* Base styles live in itemBase.scss */
</style>
