<!-- src/pages/settingsPage.vue -->
<template>
  <section class="page container">
    <header class="page-header">
      <h1>Settings</h1>
      <p class="muted">
        Enable modules, customize your theme & colors, manage your profile and
        data.
      </p>
    </header>

    <div class="stack">
      <!-- TOP: Profile (full width) -->
      <div class="card profile-card">
        <h2>Profile</h2>

        <div class="profile">
          <div class="avatar">
            <img v-if="avatar" :src="avatar" alt="Avatar preview" />
            <div v-else class="placeholder">{{ initials }}</div>
          </div>

          <div class="fields">
            <div class="inline">
              <label for="display-name">Display name</label>
              <input
                id="display-name"
                class="input"
                type="text"
                :value="name"
                @input="onNameInput"
                placeholder="Your name"
              />
            </div>

            <div class="inline">
              <span class="label">Avatar</span>
              <div class="row__controls">
                <label class="btn">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    @change="onAvatarPick"
                  />
                </label>
                <button class="btn" @click="clearAvatar" :disabled="!avatar">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- THEME & COLORS -->
      <div class="card">
        <ThemeEditor />
      </div>

      <!-- BOTTOM: 2-up grid (desktop) -->
      <div class="grid-2">
        <!-- MODULES (cleaned) -->
        <div class="card card--column">
          <h2>Modules</h2>

          <div class="module-rows">
            <!-- Notes -->
            <div class="module-row">
              <label class="toggle">
                <input
                  type="checkbox"
                  :checked="enabled.notes"
                  @change="onToggle('notes', $event)"
                />
                <span>
                  <strong>Notes</strong>
                  <small class="muted">Quick jot pad with tags & search.</small>
                </span>
              </label>
              <div class="module-actions">
                <button
                  class="btn btn--danger btn--ghost"
                  @click="clearModule('notes')"
                >
                  Clear data
                </button>
              </div>
            </div>

            <!-- Tasks -->
            <div class="module-row">
              <label class="toggle">
                <input
                  type="checkbox"
                  :checked="enabled.tasks"
                  @change="onToggle('tasks', $event)"
                />
                <span>
                  <strong>Tasks</strong>
                  <small class="muted">Light to-do with due dates.</small>
                </span>
              </label>
              <div class="module-actions">
                <button
                  class="btn btn--danger btn--ghost"
                  @click="clearModule('tasks')"
                >
                  Clear data
                </button>
              </div>
            </div>
          </div>

          <div class="spacer"></div>

          <div class="footer-actions">
            <button class="btn" @click="reset()">Reset to defaults</button>
          </div>
        </div>

        <!-- DATA -->
        <div class="card card--column">
          <h2>Data</h2>

          <div class="rows">
            <div class="inline">
              <span class="label">Export / Import</span>
              <div class="row__controls">
                <!-- Core-only export/import (User + Modules) -->
                <button class="btn" @click="exportCore">Export JSON</button>
                <label class="btn">
                  Import JSON
                  <input
                    class="sr-only"
                    type="file"
                    accept="application/json,.json"
                    @change="onImportCore"
                    hidden
                  />
                </label>
              </div>
            </div>

            <ul class="bullets">
              <li>Includes modules (Notes, Tasks) and your profile.</li>
              <li>Stored locally in your browser (IndexedDB).</li>
            </ul>

            <div v-if="storageHint" class="usage">
              <small class="muted"
                >Approx. storage used: {{ storageHint }}</small
              >
            </div>
          </div>

          <div class="spacer"></div>

          <div class="footer-actions">
            <small class="muted"
              >Tip: export a backup before clearing storage.</small
            >
          </div>

          <div class="danger-zone">
            <h3>Danger Zone</h3>
            <p class="muted">
              Delete <strong>all local data</strong> for this app on this device
              (IndexedDB, local/session storage, caches). This cannot be undone.
            </p>
            <button class="btn btn--danger" @click="onWipeAll">
              Delete all local data
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useModuleSettingsStore } from "../stores/moduleSettings.store";
import { useUserStateStore } from "../stores/userState.store";
import type { ModuleId } from "../types/settings.types";
import { useExportImport } from "../composables/useExportImport";
import { useStorageMaintenance } from "../composables/useStorageMaintenance";
import { useModuleMaintenance } from "../composables/useModuleMaintenance";

// Embedded Theme Editor
import ThemeEditor from "../modules/settings/themeEditor.vue";

const settings = useModuleSettingsStore();
const user = useUserStateStore();

// Core-only export/import (User + Modules)
const { exportCore, importCore } = useExportImport();

const { wipeAllAppData, estimateStorage } = useStorageMaintenance();
const { clearNotesData, clearTasksData } = useModuleMaintenance();

/* Modules (on/off only) — normalized to a total map so TS never sees undefined */
const enabled = computed<Record<ModuleId, boolean>>(() => {
  const m = settings.enabled as Partial<Record<ModuleId, boolean>> | undefined;
  return {
    notes: !!m?.notes,
    tasks: !!m?.tasks,
  };
});

function onToggle(id: ModuleId, e: Event) {
  settings.setEnabled(id, (e.target as HTMLInputElement).checked);
}

function reset() {
  settings.reset();
}

async function clearModule(id: ModuleId) {
  const msg =
    id === "notes"
      ? "This will permanently delete all Notes stored locally on this device. Export first if needed.\n\nProceed?"
      : "This will permanently delete all Tasks stored locally on this device. Export first if needed.\n\nProceed?";
  if (!window.confirm(msg)) return;

  try {
    if (id === "notes") await clearNotesData();
    if (id === "tasks") await clearTasksData();
    window.alert(
      `${
        (id as string).charAt(0).toUpperCase() + (id as string).slice(1)
      } data cleared.`
    );
  } catch {
    window.alert(
      "Could not clear module data. You can use the global wipe in Data ▸ Danger Zone if needed."
    );
  }
}

/* Profile */
const name = computed(() => user.displayName);
const avatar = computed(() => user.avatarDataUrl);
const initials = computed(() => {
  const n = user.displayName.trim();
  const [a = "", b = ""] = n.split(/\s+/);
  return (a[0] || "C").toUpperCase() + (b[0] || "").toUpperCase();
});
function onNameInput(e: Event) {
  user.setName((e.target as HTMLInputElement).value);
}
async function onAvatarPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  if (!file) return;
  const dataUrl = await fileToDataUrl(file);
  user.setAvatar(dataUrl);
}
function clearAvatar() {
  user.clearAvatar();
}
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Read failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/* Core-only Import handler */
async function onImportCore(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  if (!file) return;
  try {
    await importCore(file); // core-only (no theme)
    input.value = "";
  } catch {
    window.alert("Import failed. Check the file.");
  }
}

/* Storage usage hint */
const storageHint = ref<string>("");
onMounted(async () => {
  const est = await estimateStorage();
  if (est && typeof est.quota === "number" && est.quota > 0) {
    const mb = (n: number) => (n / (1024 * 1024)).toFixed(2) + " MB";
    const usage = typeof est.usage === "number" ? est.usage : 0;
    storageHint.value = `${mb(usage)} of ${mb(est.quota)} used`;
  }
});

/* Danger Zone: wipe all local data */
async function onWipeAll() {
  const sure = window.confirm(
    "This will permanently delete ALL locally stored data for this app on this device (IndexedDB, local/session storage, caches). Make sure you exported a backup first.\n\nProceed?"
  );
  if (!sure) return;

  try {
    await wipeAllAppData();
    window.alert("Local data deleted. The app will reload.");
  } finally {
    location.reload();
  }
}
</script>

<style scoped>
/* Layout shells */
.stack {
  display: grid;
  gap: 1rem;
}

.grid-2 {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}
@media (min-width: 1040px) {
  .grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}

h2 {
  margin: 0 0 0.5rem;
  font-size: var(--fs-2);
}

/* Cards */
.card--column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.footer-actions {
  margin-top: 0.25rem;
  display: flex;
  justify-content: flex-end;
}
.spacer {
  flex: 1 1 auto;
}

/* Profile */
.profile-card {
  padding-top: 1rem;
}
.profile {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  align-items: center;
}
.avatar {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--panel-subtle);
  display: grid;
  place-items: center;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  font-weight: 700;
  opacity: 0.7;
}

/* Form grid */
.fields {
  display: grid;
  gap: 0.75rem;
  width: 100%;
}
.inline {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  max-width: 560px;
}
.inline .input {
  max-width: 360px;
}
.inline .row__controls {
  gap: 0.5rem;
}
.label {
  font-weight: 600;
}

/* Modules card UI */
.module-rows {
  display: grid;
  gap: 0.5rem;
}
.module-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 0.75rem;
  padding: 0.25rem 0;
}
.toggle {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: start;
  gap: 0.5rem;
}
.toggle strong {
  display: block;
}
.toggle small {
  display: block;
  line-height: 1.2;
}

.module-actions {
  display: inline-flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.btn--ghost {
  background: var(--panel);
  border-color: var(--border);
}

/* Data card */
.bullets {
  margin: 0.25rem 0 0;
  padding-left: 1.2rem;
}
.bullets li {
  margin: 0.1rem 0;
}

.btn {
  border: 1px solid var(--border);
  background: var(--panel-elev, var(--panel));
  padding: 0.4rem 0.65rem;
  border-radius: 8px;
}
.btn--danger {
  border-color: var(--danger, #ef4444);
  color: var(--danger, #ef4444);
  background: color-mix(in srgb, var(--danger, #ef4444) 12%, transparent);
}
.btn--danger.btn--ghost {
  background: var(--panel);
}

/* Danger Zone */
.danger-zone {
  border-top: 1px dashed var(--border);
  margin-top: 0.75rem;
  padding-top: 0.75rem;
}

/* Misc */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.input {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  color: inherit;
  font: inherit;
}
.input:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}
.usage {
  margin-top: 0.25rem;
}
</style>
