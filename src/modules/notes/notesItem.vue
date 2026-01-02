<template>
  <item-shell @click="$emit('open')">
    <template #leading>📄</template>
    <div class="title">{{ note.title || "Untitled" }}</div>
    <template #meta>{{ timeAgo }}</template>
    <template #actions>
      <button class="btn" @click.stop="$emit('open')">Open</button>
      <button class="btn" @click.stop="$emit('delete')">Delete</button>
    </template>
  </item-shell>
</template>

<script setup lang="ts">
import ItemShell from "../../components/ui/ItemShell.vue";
import { computed } from "vue";
import type { Note } from "../../types/notes.types";

const props = defineProps<{ note: Note }>();
defineEmits<{ (e: "open"): void; (e: "delete"): void }>();

const timeAgo = computed(() => {
  const ms = Date.now() - props.note.updatedAt;
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  return `${days}d`;
});
</script>

<style scoped>
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 42ch;
}
.btn {
  border: 1px solid var(--border);
  background: var(--panel-elev, var(--panel));
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}
</style>
