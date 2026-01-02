<template>
  <ul class="list">
    <li v-for="t in props.tasks" :key="t.id" class="row">
      <label class="check">
        <input
          type="checkbox"
          :checked="t.status === 'done'"
          @change="onToggle(t.id, $event)"
        />
        <span class="box" aria-hidden="true"></span>
      </label>

      <div class="main" @click="edit(t.id)" role="button" tabindex="0">
        <h4 class="title">
          <span class="badge" :data-status="t.status">{{
            label(t.status)
          }}</span>
          {{ t.title || "Untitled task" }}
        </h4>
        <p class="meta">
          <span v-if="t.dueAt">Due {{ rel(t.dueAt) }}</span>
          <span v-if="t.notes" class="sep">·</span>
          <span v-if="t.notes" class="notes-prev">{{ preview(t.notes) }}</span>
        </p>
      </div>

      <div class="actions">
        <button
          class="iconbtn danger"
          aria-label="Delete task"
          @click.stop="del(t.id)"
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
type Status = "todo" | "doing" | "done";
interface TaskLike {
  id: string;
  title?: string;
  status?: Status;
  notes?: string;
  dueAt?: number;
}

const props = defineProps<{
  tasks: TaskLike[];
  onDelete?: (id: string) => any;
  onToggleDone?: (id: string, checked: boolean) => any;
  onEdit?: (id: string) => any;
}>();

function del(id: string) {
  if (props.onDelete) props.onDelete(id);
}

function edit(id: string) {
  if (props.onEdit) props.onEdit(id);
}

function onToggle(id: string, e: Event) {
  if (props.onToggleDone)
    props.onToggleDone(id, (e.target as HTMLInputElement).checked);
}

function preview(body?: string) {
  const t = (body ?? "").replace(/\s+/g, " ").trim();
  return t.length > 100 ? t.slice(0, 100) + "…" : t;
}

function label(s?: Status) {
  return s === "done" ? "Done" : s === "doing" ? "In progress" : "To do";
}

function rel(ms: number) {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const MIN = 60_000,
    H = 3_600_000,
    D = 86_400_000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < H) return rtf.format(Math.round(diff / MIN), "minute");
  if (abs < D) return rtf.format(Math.round(diff / H), "hour");
  return rtf.format(Math.round(diff / D), "day");
}
</script>

<style scoped>
.list {
  display: grid;
  gap: 0.5rem;
}

/* row layout */
.row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
  gap: 0.7rem;
}

/* checkbox */
.check {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
}
.check input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.box {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--panel-subtle);
}
.check input:checked + .box {
  background: color-mix(in srgb, var(--text) 10%, var(--panel));
}

/* text */
.main {
  min-width: 0;
  cursor: pointer;
}
.title {
  margin: 0 0 0.15rem;
  font-size: var(--fs-1);
  font-weight: 700;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.meta {
  margin: 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sep {
  margin: 0 0.25rem;
}
.notes-prev {
  opacity: 0.9;
}

/* status badge */
.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--panel-subtle);
}
.badge[data-status="doing"] {
  background: color-mix(in srgb, var(--text) 6%, var(--panel-subtle));
}
.badge[data-status="done"] {
  background: color-mix(in srgb, var(--text) 10%, var(--panel-subtle));
}

/* actions */
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
