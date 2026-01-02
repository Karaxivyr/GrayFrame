<template>
  <base-module title="Tasks">
    <!-- Header actions: kebab (···) menu -->
    <template #actions>
      <div class="menu-wrap" ref="menuWrap">
        <button class="iconbtn" aria-label="Open menu" @click="toggleMenu">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="6" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="18" cy="12" r="1.8" />
          </svg>
        </button>
        <div v-if="menuOpen" class="menu" role="menu">
          <button class="menu__item" role="menuitem" @click="openNew">
            New task
          </button>
        </div>
      </div>
    </template>

    <div class="tasks">
      <tasks-empty v-if="count === 0" @new="openNew" @create="openNew" />
      <tasks-list
        v-else
        :tasks="items"
        :onDelete="requestDelete"
        :onToggleDone="toggleDone"
        :onEdit="beginEdit"
      />
    </div>

    <!-- Create/Edit modal -->
    <base-modal v-model="showModal" size="md">
      <template #title>{{ editingId ? "Edit Task" : "New Task" }}</template>

      <form class="form" @submit.prevent="save">
        <div class="field">
          <label for="task-title">Title</label>
          <input
            id="task-title"
            ref="titleEl"
            v-model.trim="draft.title"
            type="text"
            class="input"
            placeholder="Task title"
            maxlength="120"
          />
        </div>

        <div class="field two">
          <div>
            <label for="task-status">Status</label>
            <select id="task-status" v-model="draft.status" class="input">
              <option value="todo">To do</option>
              <option value="doing">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label for="task-due">Due (optional)</label>
            <input
              id="task-due"
              v-model="draft.dueAtStr"
              type="datetime-local"
              class="input"
            />
          </div>
        </div>

        <div class="field">
          <label for="task-notes">Notes (optional)</label>
          <textarea
            id="task-notes"
            v-model.trim="draft.notes"
            class="input"
            rows="6"
            placeholder="Details…"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button class="btn" @click="cancel">Cancel</button>
        <button class="btn btn--primary" :disabled="!canSave" @click="save">
          Save
        </button>
      </template>
    </base-modal>

    <!-- In-app confirm for delete -->
    <confirm-dialog
      v-model="confirmOpen"
      title="Delete task?"
      :message="confirmMessage"
      confirm-label="Delete"
      cancel-label="Cancel"
      kind="danger"
      @confirm="performDelete"
    />
  </base-module>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import BaseModule from "../../components/ui/baseModule.vue";
import BaseModal from "../../components/ui/baseModal.vue";
import ConfirmDialog from "../../components/ui/confirmDialog.vue";
import TasksList from "./tasksList.vue";
import TasksEmpty from "./tasksEmpty.vue";
import { useTasksStore } from "../../stores/tasks.store";

type Status = "todo" | "doing" | "done";

const store = useTasksStore();
const items = computed(() => (store as any).items ?? []);
const count = computed(() => (store as any).count ?? items.value.length);

const showModal = ref(false);
const titleEl = ref<HTMLInputElement | null>(null);
const editingId = ref<string | null>(null);
const draft = reactive<{
  title: string;
  status: Status;
  notes: string;
  dueAtStr: string | null; // datetime-local string
}>({ title: "", status: "todo", notes: "", dueAtStr: null });

/* kebab menu */
const menuOpen = ref(false);
const menuWrap = ref<HTMLElement | null>(null);
function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
function onDocClick(e: MouseEvent) {
  if (!menuOpen.value) return;
  const el = menuWrap.value;
  if (el && !el.contains(e.target as Node)) menuOpen.value = false;
}
onMounted(() =>
  document.addEventListener("click", onDocClick, { capture: true })
);
onUnmounted(() =>
  document.removeEventListener("click", onDocClick, { capture: true })
);

function openNew() {
  menuOpen.value = false;
  editingId.value = null;
  draft.title = "";
  draft.status = "todo";
  draft.notes = "";
  draft.dueAtStr = null;
  showModal.value = true;
  nextTick(() => titleEl.value?.focus());
}
function cancel() {
  showModal.value = false;
}

const canSave = computed(() => draft.title.trim().length > 0);

function beginEdit(id: string) {
  const t = items.value.find((x: any) => x.id === id);
  if (!t) return;
  editingId.value = id;
  draft.title = t.title ?? "";
  draft.status = (t.status ?? "todo") as Status;
  draft.notes = t.notes ?? t.description ?? "";
  draft.dueAtStr = t.dueAt ? toLocalDateTimeInput(t.dueAt) : null;
  showModal.value = true;
  nextTick(() => titleEl.value?.focus());
}

function toggleDone(id: string, checked: boolean) {
  const toStatus: Status = checked ? "done" : "todo";
  if (typeof (store as any).update === "function") {
    (store as any).update(id, { status: toStatus });
  } else if (typeof (store as any).setStatus === "function") {
    (store as any).setStatus(id, toStatus);
  } else {
    // last-resort mutation if store lacks an action
    const idx = (store as any).items?.findIndex((t: any) => t.id === id) ?? -1;
    if (idx >= 0) (store as any).items[idx].status = toStatus;
  }
}

function save() {
  if (!canSave.value) return;
  const now = Date.now();
  const dueAt = draft.dueAtStr ? Date.parse(draft.dueAtStr) : undefined;

  if (editingId.value) {
    // Prefer update(id, patch)
    if (typeof (store as any).update === "function") {
      (store as any).update(editingId.value, {
        title: draft.title.trim(),
        status: draft.status,
        notes: draft.notes.trim(),
        dueAt,
      });
    } else {
      // minimal fallback
      const idx =
        (store as any).items?.findIndex((t: any) => t.id === editingId.value) ??
        -1;
      if (idx >= 0)
        Object.assign((store as any).items[idx], {
          title: draft.title.trim(),
          status: draft.status,
          notes: draft.notes.trim(),
          dueAt,
          updatedAt: now,
        });
    }

    // optional timestamp helper
    if (typeof (store as any).touch === "function")
      (store as any).touch(editingId.value, now);
    else if (typeof (store as any).setUpdated === "function")
      (store as any).setUpdated(editingId.value, now);
  } else {
    const create =
      (store as any).create ?? (store as any).add ?? (store as any).addTask;
    if (typeof create === "function") {
      create({
        title: draft.title.trim(),
        status: draft.status,
        notes: draft.notes.trim(),
        dueAt,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      (store as any).items.push({
        id: crypto.randomUUID(),
        title: draft.title.trim(),
        status: draft.status,
        notes: draft.notes.trim(),
        dueAt,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  showModal.value = false;
}

/* Delete flow (in-app confirm) */
const confirmOpen = ref(false);
const pendingDeleteId = ref<string | null>(null);
const confirmMessage = computed(
  () => "This will permanently remove the task. This cannot be undone."
);

function requestDelete(id: string) {
  pendingDeleteId.value = id || null;
  if (!pendingDeleteId.value) return;
  confirmOpen.value = true;
}
function performDelete() {
  const id = pendingDeleteId.value;
  if (!id) return;
  if (typeof (store as any).remove === "function") (store as any).remove(id);
  else if (typeof (store as any).delete === "function")
    (store as any).delete(id);
  else
    (store as any).items = (store as any).items.filter((t: any) => t.id !== id);
  pendingDeleteId.value = null;
}

/* helpers */
function toLocalDateTimeInput(ms: number): string {
  // converts epoch ms -> yyyy-MM-ddTHH:mm (local)
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}
</script>

<style scoped>
.tasks {
  min-height: 120px;
}

/* kebab menu */
.menu-wrap {
  position: relative;
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
.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.35rem);
  min-width: 160px;
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: 10px;
  box-shadow: var(--shadow-2, 0 10px 40px rgba(0, 0, 0, 0.45));
  padding: 0.35rem;
  z-index: 5;
}
.menu__item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
}
.menu__item:hover {
  background: color-mix(in srgb, var(--panel-subtle) 65%, transparent);
}

/* modal form */
.form {
  display: grid;
  gap: 0.8rem;
}
.field {
  display: grid;
  gap: 0.35rem;
}
.field.two {
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
.field label {
  font-weight: 600;
}
textarea.input {
  line-height: 1.45;
}
@media (max-width: 720px) {
  .field.two {
    grid-template-columns: 1fr;
  }
}
</style>
