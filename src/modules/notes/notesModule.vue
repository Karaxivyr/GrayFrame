<template>
  <base-module title="Notes">
    <!-- Header actions: kebab menu -->
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
            New note
          </button>
        </div>
      </div>
    </template>

    <div class="notes">
      <notes-empty v-if="count === 0" @new="openNew" @create="openNew" />
      <notes-list v-else :notes="items" :onDelete="requestDelete" />
    </div>

    <!-- Create/Edit modal -->
    <base-modal v-model="showModal" size="md">
      <template #title>{{ editingId ? "Edit Note" : "New Note" }}</template>

      <form class="form" @submit.prevent="save">
        <div class="field">
          <label for="note-title">Title</label>
          <input
            id="note-title"
            ref="titleEl"
            v-model.trim="draft.title"
            type="text"
            class="input"
            placeholder="Note title"
            maxlength="120"
          />
        </div>

        <div class="field">
          <label for="note-body">Body</label>
          <textarea
            id="note-body"
            v-model.trim="draft.body"
            class="input"
            rows="8"
            placeholder="Write your note..."
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

    <!-- In-app confirm (replaces window.confirm) -->
    <confirm-dialog
      v-model="confirmOpen"
      title="Delete note?"
      :message="confirmMessage"
      confirm-label="Delete"
      cancel-label="Cancel"
      kind="danger"
      @confirm="performDelete"
    />
  </base-module>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import BaseModule from "../../components/ui/baseModule.vue";
import BaseModal from "../../components/ui/baseModal.vue";
import ConfirmDialog from "../../components/ui/confirmDialog.vue";
import NotesList from "./notesList.vue";
import NotesEmpty from "./notesEmpty.vue";
import { useNotesStore } from "../../stores/notes.store";

const store = useNotesStore();
const items = computed(() => store.items ?? []);
const count = computed(() => store.count ?? items.value.length);

const showModal = ref(false);
const titleEl = ref<HTMLInputElement | null>(null);
const editingId = ref<string | null>(null);
const draft = reactive({ title: "", body: "" });

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
  draft.body = "";
  showModal.value = true;
  nextTick(() => titleEl.value?.focus());
}
function cancel() {
  showModal.value = false;
}

const canSave = computed(
  () => draft.title.trim().length > 0 || draft.body.trim().length > 0
);

async function save() {
  if (!canSave.value) return;
  const now = Date.now();

  if (editingId.value) {
    store.update(editingId.value, {
      title: draft.title.trim(),
      body: draft.body.trim(),
    });
    if (typeof (store as any).touch === "function")
      (store as any).touch(editingId.value, now);
    else if (typeof (store as any).setUpdated === "function")
      (store as any).setUpdated(editingId.value, now);
  } else {
    const create =
      (store as any).create ?? (store as any).add ?? (store as any).addNote;
    if (typeof create === "function") {
      create({
        title: draft.title.trim(),
        body: draft.body.trim(),
        createdAt: now,
        updatedAt: now,
      });
    } else {
      (store.items as any).push({
        id: crypto.randomUUID(),
        title: draft.title.trim(),
        body: draft.body.trim(),
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  showModal.value = false;
}

/* Delete flow using in-app confirm */
const confirmOpen = ref(false);
const pendingDeleteId = ref<string | null>(null);
const confirmMessage = computed(
  () => "This will permanently remove the note. This cannot be undone."
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
    (store.items as any) = (store.items as any).filter((n: any) => n.id !== id);
  pendingDeleteId.value = null;
}

/* optional edit wiring (future) */
watch(
  () => editingId.value,
  (id) => {
    if (!id) return;
    const n = items.value.find((n) => n.id === id);
    draft.title = n?.title ?? "";
    draft.body = n?.body ?? "";
    nextTick(() => titleEl.value?.focus());
  }
);
</script>

<style scoped>
.notes {
  min-height: 120px;
}

/* menu */
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
.field label {
  font-weight: 600;
}
textarea.input {
  line-height: 1.45;
}
</style>
