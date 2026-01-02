<template>
  <base-modal :open="open" :title="title" @close="$emit('close')">
    <div class="focus"><slot /></div>
    <template #footer><slot name="footer" /></template>
  </base-modal>
</template>

<script setup lang="ts">
import BaseModal from "./baseModal.vue";
defineProps<{ open: boolean; title?: string }>();
defineEmits<{ (e: "close"): void }>();
</script>

<style scoped>
.focus {
  min-height: 220px;
}
</style>
