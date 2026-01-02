<template>
  <item-shell @click="$emit('open')">
    <template #leading>
      <input
        type="checkbox"
        :checked="task.status === 'done'"
        @click.stop
        @change="$emit('toggle')"
      />
    </template>

    <div class="title" :class="{ done: task.status === 'done' }">
      {{ task.title || "Untitled task" }}
    </div>

    <template #meta>
      <span v-if="task.dueAt" class="due">due {{ dueAgo }}</span>
      <span v-else class="muted">{{ timeAgo }}</span>
    </template>

    <template #actions>
      <button class="btn" @click.stop="$emit('open')">Edit</button>
      <button class="btn" @click.stop="$emit('delete')">Delete</button>
    </template>
  </item-shell>
</template>

<script setup lang="ts">
import ItemShell from "../../components/ui/ItemShell.vue";
import { computed } from "vue";
import type { Task } from "../../types/task.types";

const props = defineProps<{ task: Task }>();
defineEmits<{ (e: "open"): void; (e: "toggle"): void; (e: "delete"): void }>();

function ago(ts: number): string {
  const ms = Date.now() - ts;
  const m = Math.round(ms / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}
const timeAgo = computed(() => ago(props.task.updatedAt));
const dueAgo = computed(() => ago(props.task.dueAt!));
</script>

<style scoped>
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 42ch;
}
.title.done {
  opacity: 0.65;
  text-decoration: line-through;
}
.due {
  font-size: var(--fs-0);
  opacity: 0.9;
}
.btn {
  border: 1px solid var(--border);
  background: var(--panel-elev, var(--panel));
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}
</style>
