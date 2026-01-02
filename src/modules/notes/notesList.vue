<template>
  <ul class="list">
    <li v-for="n in props.notes" :key="n.id" class="row">
      <div class="main" @click="open(n.id)" role="button" tabindex="0">
        <h4 class="title">{{ n.title || "Untitled" }}</h4>
        <p class="preview">{{ preview(n.body) }}</p>
      </div>
      <div class="actions">
        <button
          class="iconbtn danger"
          aria-label="Delete note"
          @click.stop="del(n.id)"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Note } from "../../types/notes.types";

const props = defineProps<{
  notes: Note[];
  onDelete?: (id: string) => any;
  onOpen?: (id: string) => any;
}>();

const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "open", id: string): void;
}>();

function del(id: string) {
  if (props.onDelete) props.onDelete(id);
  else emit("delete", id);
}

function open(id: string) {
  if (props.onOpen) props.onOpen(id);
  else emit("open", id);
}

function preview(body?: string) {
  const t = (body ?? "").replace(/\s+/g, " ").trim();
  return t.length > 120 ? t.slice(0, 120) + "…" : t || "—";
}
</script>

<style scoped>
.list {
  display: grid;
  gap: 0.5rem;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
}
.main {
  min-width: 0;
  cursor: pointer;
}
.title {
  margin: 0 0 0.15rem;
  font-size: var(--fs-1);
  font-weight: 700;
}
.preview {
  margin: 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actions {
  display: flex;
  gap: 0.35rem;
}
.iconbtn {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--panel);
  color: inherit;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.iconbtn:hover {
  background: color-mix(in srgb, var(--panel) 70%, var(--panel-subtle));
}
.iconbtn.danger:hover {
  color: #ff6961;
  border-color: color-mix(in srgb, #ff6961 45%, var(--border));
}
</style>
