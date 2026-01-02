<template>
  <div class="bar">
    <div class="pill">📝 {{ notesCount }} notes</div>
    <div class="pill">✅ {{ tasksOpen }} open / {{ tasksDone }} done</div>
    <div class="spacer" />
    <button class="btn" @click="$emit('new-note')">New note</button>
    <button class="btn" @click="$emit('new-task')">New task</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNotesStore } from "../../stores/notes.store";
import { useTasksStore } from "../../stores/tasks.store";

const notes = useNotesStore();
const tasks = useTasksStore();

const notesCount = computed(() => notes.count);
const tasksOpen = computed(() => tasks.openCount);
const tasksDone = computed(() => tasks.doneCount);

defineEmits<{ (e: "new-note"): void; (e: "new-task"): void }>();
</script>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 12px;
  box-shadow: var(--shadow-1);
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
}
.pill {
  border: 1px solid var(--border);
  background: var(--panel-elev, var(--panel));
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.9rem;
}
.spacer {
  flex: 1 1 auto;
}
.btn {
  border: 1px solid var(--border);
  background: var(--panel-elev, var(--panel));
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
}
</style>
