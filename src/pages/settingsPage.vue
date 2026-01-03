<template>
  <section class="page container">
    <header class="page-header">
      <h1>Settings</h1>
      <p class="muted">
        Enable modules, set theme, and personalize your profile.
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

      <!-- BOTTOM: grid (Modules + Data) -->
      <div class="grid-3 two-col">
        <!-- Modules -->
        <div class="card card--column">
          <h2>Modules</h2>

          <div class="rows">
            <label class="toggle">
              <input
                type="checkbox"
                :checked="enabled.notes"
                @change="onToggle('notes', $event)"
              />
              <span>Notes</span>
            </label>
            <label class="toggle">
              <input
                type="checkbox"
                :checked="enabled.tasks"
                @change="onToggle('tasks', $event)"
              />
              <span>Tasks</span>
            </label>
          </div>

          <div class="spacer"></div>

          <div class="footer-actions">
            <button class="btn" @click="reset()">Reset to defaults</button>
          </div>
        </div>

        <!-- Data -->
        <div class="card card--column">
          <h2>Data</h2>

          <div class="rows">
            <div class="inline">
              <span class="label">Export / Import</span>
              <div class="row__controls">
                <button class="btn" @click="exportAll">Export JSON</button>
                <label class="btn">
                  Import JSON
                  <input
                    class="sr-only"
                    type="file"
                    accept="application/json,.json"
                    @change="onImport"
                    hidden
                  />
                </label>
              </div>
            </div>

            <ul class="bullets">
              <li>Includes modules, notes, tasks, theme, and profile.</li>
              <li>Stored locally in your browser (IndexedDB).</li>
            </ul>
          </div>

          <div class="spacer"></div>

          <div class="footer-actions">
            <small class="muted"
              >Tip: keep a backup before clearing your browser storage.</small
            >
          </div>
        </div>
      </div>

      <!-- Full-width Theme & Colors editor (becomes the only place for mode + colors) -->
      <div class="card card--column">
        <ThemeEditor />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useModuleSettingsStore } from "../stores/moduleSettings.store";
import { useUserStateStore } from "../stores/userState.store";
import type { ModuleId } from "../types/settings.types";
import { useExportImport } from "../composables/useExportImport";

/* Theme editor is now the single source for mode + colors */
import ThemeEditor from "../modules/settings/themeEditor.vue";

const settings = useModuleSettingsStore();
const user = useUserStateStore();
const { exportAll, importAll } = useExportImport();

/* Modules (on/off only) */
const enabled = computed(() => settings.enabled);
function onToggle(id: ModuleId, e: Event) {
  settings.setEnabled(id, (e.target as HTMLInputElement).checked);
}
function reset() {
  settings.reset();
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
  const file = (e.target as HTMLInputElement).files?.[0];
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

/* Data */
async function onImport(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    await importAll(file);
    input.value = "";
  } catch {
    alert("Import failed. Check the file.");
  }
}
</script>

<style scoped>
/* Layout shells */
.stack {
  display: grid;
  gap: 1rem;
}

/* two columns on wide screens now that Appearance is removed */
.grid-3.two-col {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}
@media (min-width: 1040px) {
  .grid-3.two-col {
    grid-template-columns: 1fr 1fr;
  }
}

h2 {
  margin: 0 0 0.5rem;
  font-size: var(--fs-2);
}

/* Cards that balance vertical space */
/* Cards that balance vertical space */
.card--column {
  display: flex;
  flex-direction: column;
  /* min-height: 260px;  ❌ remove hard height */
  gap: 0.5rem; /* keeps content breathing */
}

.footer-actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}
.spacer {
  flex: 1 1 auto;
}

/* Profile card */
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

/* Proportional form grid inside Profile */
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

/* Rows / toggles */
.rows {
  display: grid;
  gap: 0.6rem;
}
.toggle {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

/* Buttons & helpers */
.btn {
  border: 1px solid var(--border);
  background: var(--panel-elev, var(--panel));
  padding: 0.4rem 0.65rem;
  border-radius: 8px;
}
.row__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.bullets {
  margin: 0.25rem 0 0;
  padding-left: 1.2rem;
}
.bullets li {
  margin: 0.1rem 0;
}
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
</style>
