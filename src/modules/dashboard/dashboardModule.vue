<template>
  <!-- Read-only overview; no create actions -->
  <base-module title="Dashboard " subtitle="At A Glance" :readonly="true">
    <div class="stats">
      <!-- NOTES TILE -->
      <article class="stat">
        <header class="stat__head">
          <span class="glyph" aria-hidden="true">
            <!-- paper/notes icon -->
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M8 3h8a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
              />
              <path d="M9 8h6M9 12h6M9 16h4" />
            </svg>
          </span>
          <h3>Notes</h3>
        </header>

        <p class="stat__value">{{ notesCount }}</p>
        <p class="stat__hint">total</p>

        <dl class="meta">
          <div>
            <dt>Last updated</dt>
            <dd>{{ notesLastUpdated || "—" }}</dd>
          </div>
          <div>
            <dt>Most recent</dt>
            <dd class="truncate" :title="notesLastTitle || undefined">
              {{ notesLastTitle || "—" }}
            </dd>
          </div>
        </dl>
      </article>

      <!-- TASKS TILE -->
      <article class="stat">
        <header class="stat__head">
          <span class="glyph" aria-hidden="true">
            <!-- checkbox/task icon -->
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="m8 12 3 3 5-6" />
            </svg>
          </span>
          <h3>Tasks</h3>
        </header>

        <p class="stat__value">
          {{ openCount }} <span class="stat__unit">open</span>
        </p>
        <p class="stat__hint">{{ doneCount }} done</p>

        <dl class="meta">
          <div>
            <dt>Completion</dt>
            <dd>{{ completionRate }}</dd>
          </div>
          <div>
            <dt>Last activity</dt>
            <dd>{{ tasksLastUpdated || "—" }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </base-module>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseModule from "../../components/ui/baseModule.vue";
import { useNotesStore } from "../../stores/notes.store";
import { useTasksStore } from "../../stores/tasks.store";

/* Stores */
const notes = useNotesStore();
const tasks = useTasksStore();

/* Safe access to item arrays if store naming differs */
const noteItems = computed<any[]>(
  () => (notes as any).items ?? (notes as any).list ?? []
);
const taskItems = computed<any[]>(
  () => (tasks as any).items ?? (tasks as any).list ?? []
);

/* Counts */
const notesCount = computed(
  () => (notes as any).count ?? noteItems.value.length
);
const openCount = computed(
  () =>
    (tasks as any).openCount ??
    taskItems.value.filter((t) => t?.status !== "done").length
);
const doneCount = computed(
  () =>
    (tasks as any).doneCount ??
    taskItems.value.filter((t) => t?.status === "done").length
);

/* Completion rate */
const completionRate = computed(() => {
  const total = openCount.value + doneCount.value;
  if (!total) return "—";
  const pct = Math.round((doneCount.value / total) * 100);
  return `${pct}%`;
});

/* Last updated + recent titles */
function relativeFromNow(ms?: number): string | undefined {
  if (!ms || Number.isNaN(ms)) return undefined;
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

const notesLast = computed(() => {
  const arr = noteItems.value;
  if (!arr.length) return undefined;
  let latest = arr[0];
  for (const n of arr) {
    const a = latest?.updatedAt ?? latest?.createdAt ?? 0;
    const b = n?.updatedAt ?? n?.createdAt ?? 0;
    if (b > a) latest = n;
  }
  return latest;
});
const notesLastUpdated = computed(() =>
  relativeFromNow(notesLast.value?.updatedAt ?? notesLast.value?.createdAt)
);
const notesLastTitle = computed(() => notesLast.value?.title);

const tasksLast = computed(() => {
  const arr = taskItems.value;
  if (!arr.length) return undefined;
  let latest = arr[0];
  for (const t of arr) {
    const a = latest?.updatedAt ?? latest?.createdAt ?? 0;
    const b = t?.updatedAt ?? t?.createdAt ?? 0;
    if (b > a) latest = t;
  }
  return latest;
});
const tasksLastUpdated = computed(() =>
  relativeFromNow(tasksLast.value?.updatedAt ?? tasksLast.value?.createdAt)
);
</script>

<style scoped>
/* Grid of tiles */
.stats {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: 1fr;
}
@media (min-width: 880px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}

/* Tiles */
.stat {
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--panel);
  padding: 1rem;
  box-shadow: var(--shadow-1);
}

.stat__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  color: var(--text);
}
.glyph {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--panel-subtle) 70%, transparent);
  color: color-mix(in srgb, var(--text) 70%, transparent);
}
h3 {
  margin: 0;
  font-size: var(--fs-2);
}

.stat__value {
  margin: 0.15rem 0 0;
  font-weight: 800;
  font-size: clamp(1.35rem, 1rem + 1.2vw, 1.8rem);
}
.stat__unit {
  font-weight: 600;
  opacity: 0.85;
}
.stat__hint {
  margin: 0.15rem 0 0;
  opacity: 0.7;
}

/* Meta list (two rows) */
.meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 0.75rem;
  margin-top: 0.6rem;
}
.meta dt {
  font-size: var(--fs-0);
  opacity: 0.75;
}
.meta dd {
  margin: 0.1rem 0 0;
  font-weight: 600;
}
.truncate {
  max-width: 28ch;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
