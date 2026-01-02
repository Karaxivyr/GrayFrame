<template>
  <div class="empty">
    <p class="muted">No notes yet</p>
    <p class="muted small">Start with a quick thought. You can edit anytime.</p>
    <button class="btn btn--primary" @click="$emit('new')">New note</button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.empty {
  text-align: center;
  padding: 1.25rem 0;
}
.small {
  opacity: 0.8;
  font-size: 0.9em;
}
</style>
