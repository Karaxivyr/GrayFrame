<template>
  <section class="card theme-editor">
    <header class="theme-header">
      <div>
        <h2>Theme & Colors</h2>
        <p class="muted">
          Tune every color. Changes apply instantly and persist on this device.
        </p>
      </div>

      <div class="mode-toggle">
        <button
          class="btn"
          :class="{ 'btn--primary': mode === 'light' }"
          @click="setThemeMode('light')"
        >
          Light
        </button>
        <button
          class="btn"
          :class="{ 'btn--primary': mode === 'dark' }"
          @click="setThemeMode('dark')"
        >
          Dark
        </button>
      </div>
    </header>

    <div class="grid">
      <!-- Brand -->
      <fieldset>
        <legend>Brand</legend>
        <div v-for="k in brandKeys" :key="k" class="row">
          <label class="label">{{ labelMap[k] }}</label>
          <input
            class="swatch"
            type="color"
            :value="safeSwatch(k)"
            @input="onSwatch(k, $event)"
          />
          <input
            class="hex"
            type="text"
            :value="draft[k]"
            @input="onHexInput(k, $event)"
            @blur="onHexCommit(k)"
            @keydown.enter.prevent="onHexCommit(k)"
            inputmode="text"
            spellcheck="false"
          />
        </div>
      </fieldset>

      <!-- Surfaces -->
      <fieldset>
        <legend>Surfaces</legend>
        <div v-for="k in surfaceKeys" :key="k" class="row">
          <label class="label">{{ labelMap[k] }}</label>
          <input
            class="swatch"
            type="color"
            :value="safeSwatch(k)"
            @input="onSwatch(k, $event)"
          />
          <input
            class="hex"
            type="text"
            :value="draft[k]"
            @input="onHexInput(k, $event)"
            @blur="onHexCommit(k)"
            @keydown.enter.prevent="onHexCommit(k)"
            inputmode="text"
            spellcheck="false"
          />
        </div>
      </fieldset>

      <!-- Text & Border -->
      <fieldset>
        <legend>Text & Border</legend>
        <div v-for="k in textKeys" :key="k" class="row">
          <label class="label">{{ labelMap[k] }}</label>
          <input
            class="swatch"
            type="color"
            :value="safeSwatch(k)"
            @input="onSwatch(k, $event)"
          />
          <input
            class="hex"
            type="text"
            :value="draft[k]"
            @input="onHexInput(k, $event)"
            @blur="onHexCommit(k)"
            @keydown.enter.prevent="onHexCommit(k)"
            inputmode="text"
            spellcheck="false"
          />
        </div>
      </fieldset>

      <!-- Status -->
      <fieldset>
        <legend>Status</legend>
        <div v-for="k in statusKeys" :key="k" class="row">
          <label class="label">{{ labelMap[k] }}</label>
          <input
            class="swatch"
            type="color"
            :value="safeSwatch(k)"
            @input="onSwatch(k, $event)"
          />
          <input
            class="hex"
            type="text"
            :value="draft[k]"
            @input="onHexInput(k, $event)"
            @blur="onHexCommit(k)"
            @keydown.enter.prevent="onHexCommit(k)"
            inputmode="text"
            spellcheck="false"
          />
        </div>
      </fieldset>
    </div>

    <div class="actions">
      <button class="btn" @click="loadPreset('light')">
        Preset: Default Light
      </button>
      <button class="btn" @click="loadPreset('dark')">
        Preset: Default Dark
      </button>
      <button class="btn" @click="loadPreset('midnight')">
        Preset: Midnight Cyan
      </button>
      <button class="btn" @click="loadPreset('contrast')">
        Preset: High Contrast
      </button>

      <span class="spacer"></span>

      <button class="btn" @click="exportTheme">Export JSON</button>
      <label class="import">
        <input
          type="file"
          accept="application/json"
          @change="importThemeFile"
        />
        <span class="btn">Import JSON</span>
      </label>

      <button class="btn" @click="resetTheme">Reset</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { useThemeStore } from "../../stores/themeStore";
import {
  serializeTheme,
  parseTheme,
  type ThemeExport,
} from "../../utils/theme";
import type { ThemeState } from "../../stores/themeStore";

type Preset = "light" | "dark" | "midnight" | "contrast";
type VarKey = keyof ThemeState["vars"];

const theme = useThemeStore();
const mode = computed(() => theme.mode);

/** Draft (text boxes) + last valid (for swatch fallback) */
const draft = reactive({ ...theme.vars }) as Record<VarKey, string>;
const lastValid = reactive({ ...theme.vars }) as Record<VarKey, string>;

/** Key buckets for rendering */
const brandKeys: VarKey[] = [
  "brandPrimary",
  "brandSecondary",
  "accent",
  "accentContrast",
];
const surfaceKeys: VarKey[] = ["bg", "panel", "panelSubtle", "panelElev"];
const textKeys: VarKey[] = ["text", "textMuted", "border"];
const statusKeys: VarKey[] = ["ok", "warn", "danger"];

/** Labels */
const labelMap: Record<VarKey, string> = {
  brandPrimary: "Primary",
  brandSecondary: "Secondary",
  accent: "Accent",
  accentContrast: "Accent Contrast",
  bg: "Background",
  panel: "Panel",
  panelSubtle: "Panel Subtle",
  panelElev: "Panel Elev",
  text: "Text",
  textMuted: "Muted",
  border: "Border",
  ok: "OK",
  warn: "Warn",
  danger: "Danger",
};

/** Helpers */
function normalizeOnCommit(v: string) {
  let s = String(v).trim().toUpperCase();
  if (!s.startsWith("#")) s = "#" + s.replace(/^#+/, "");
  if (/^#[0-9A-F]{3}$/.test(s))
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return s;
}
const isHex6 = (s: string) => /^#[0-9A-F]{6}$/.test(s);
function safeSwatch(key: VarKey) {
  return isHex6(draft[key]) ? draft[key] : lastValid[key];
}

/** Handlers */
function onHexInput(key: VarKey, e: Event) {
  draft[key] = (e.target as HTMLInputElement).value; // allow partial
}
function onHexCommit(key: VarKey) {
  const val = normalizeOnCommit(draft[key]);
  if (!isHex6(val)) return; // ignore invalid commit
  theme.setVar(key, val); // store + CSS
  draft[key] = val;
  lastValid[key] = val;
}
function onSwatch(key: VarKey, e: Event) {
  const val = normalizeOnCommit((e.target as HTMLInputElement).value); // always #RRGGBB
  theme.setVar(key, val);
  draft[key] = val;
  lastValid[key] = val;
}

/** Mode & presets */
function setThemeMode(m: "light" | "dark") {
  theme.setMode(m);
  Object.assign(draft, theme.vars);
  Object.assign(lastValid, theme.vars);
}
function resetTheme() {
  theme.reset(theme.mode);
  Object.assign(draft, theme.vars);
  Object.assign(lastValid, theme.vars);
}

/** Export / Import */
function exportTheme() {
  const data: ThemeExport = { mode: theme.mode, vars: { ...theme.vars } };
  const json = serializeTheme(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `grayframe-theme-${theme.mode}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
async function importThemeFile(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  const text = await input.files[0].text();
  const data = parseTheme(text) as ThemeState;
  theme.importTheme(data);
  Object.assign(draft, theme.vars);
  Object.assign(lastValid, theme.vars);
}

/** Presets */
function loadPreset(preset: Preset) {
  const pick = (p: Preset): ThemeState => {
    if (p === "light")
      return {
        mode: "light",
        vars: {
          brandPrimary: "#2F2F33",
          brandSecondary: "#B1B6C1",
          accent: "#3EC9C7",
          accentContrast: "#0E1A1A",
          bg: "#F5F6F8",
          panel: "#FFFFFF",
          panelSubtle: "#F0F2F5",
          panelElev: "#FFFFFF",
          text: "#2F2F33",
          textMuted: "#6B7079",
          border: "#D9DCE2",
          ok: "#30B16F",
          warn: "#E8A23B",
          danger: "#DF5B57",
        },
      };
    if (p === "dark")
      return {
        mode: "dark",
        vars: {
          brandPrimary: "#2F2F33",
          brandSecondary: "#B1B6C1",
          accent: "#3EC9C7",
          accentContrast: "#0A1515",
          bg: "#1F1F21",
          panel: "#2F2F33",
          panelSubtle: "#242427",
          panelElev: "#2B2B2E",
          text: "#EDEDED",
          textMuted: "#A0A0A0",
          border: "#3A3A3D",
          ok: "#30B16F",
          warn: "#E8A23B",
          danger: "#DF5B57",
        },
      };
    if (p === "midnight")
      return {
        mode: "dark",
        vars: {
          brandPrimary: "#202226",
          brandSecondary: "#9CA3AF",
          accent: "#29B6B3",
          accentContrast: "#071313",
          bg: "#121316",
          panel: "#1C1D20",
          panelSubtle: "#17181B",
          panelElev: "#202226",
          text: "#ECECEC",
          textMuted: "#9CA3AF",
          border: "#34363A",
          ok: "#1DBF73",
          warn: "#F2A541",
          danger: "#E35D6A",
        },
      };
    const currentMode = (theme.mode === "dark" ? "dark" : "light") as
      | "light"
      | "dark";
    return {
      mode: currentMode,
      vars: {
        brandPrimary: "#111111",
        brandSecondary: "#CFCFCF",
        accent: "#00E5E0",
        accentContrast: "#000000",
        bg: currentMode === "dark" ? "#000000" : "#FFFFFF",
        panel: currentMode === "dark" ? "#0E0E10" : "#FFFFFF",
        panelSubtle: currentMode === "dark" ? "#0A0A0C" : "#F6F6F6",
        panelElev: currentMode === "dark" ? "#141418" : "#FFFFFF",
        text: currentMode === "dark" ? "#FFFFFF" : "#111111",
        textMuted: currentMode === "dark" ? "#B5B5B5" : "#4A4A4A",
        border: currentMode === "dark" ? "#2A2A2E" : "#D0D0D0",
        ok: "#16C96B",
        warn: "#F59E0B",
        danger: "#EF4444",
      },
    };
  };

  theme.importTheme(pick(preset));
  Object.assign(draft, theme.vars);
  Object.assign(lastValid, theme.vars);
}
</script>

<style scoped lang="scss">
.theme-editor {
  display: grid;
  gap: var(--space-3);
}
.theme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mode-toggle {
  display: flex;
  gap: var(--space-1);
}

/* Responsive fieldsets */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: var(--space-3);
}
fieldset {
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: var(--space-2);
  background: var(--panel);
  min-width: 0;
}
legend {
  padding: 0 var(--space-1);
  font-size: var(--fs-1);
}

/* Row layout: label | swatch | hex */
.row {
  display: grid;
  grid-template-columns: 150px 44px minmax(180px, 1fr);
  align-items: center;
  gap: var(--space-1);
  padding: 6px 0;
}
.label {
  color: var(--text);
  white-space: nowrap;
}

/* Swatch */
.swatch {
  width: 44px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0;
  margin: 0;
  background: transparent;
  box-sizing: border-box;
  cursor: pointer;
  appearance: none;
}
.swatch::-webkit-color-swatch-wrapper {
  padding: 0;
  border: none;
}
.swatch::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}
.swatch::-moz-color-swatch {
  border: none;
  border-radius: 6px;
}

/* Hex field */
.hex {
  width: 100%;
  min-width: 0;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel-subtle);
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

/* Controls */
.actions {
  display: flex;
  gap: var(--space-1);
  align-items: center;
  flex-wrap: wrap;
}
.actions .spacer {
  flex: 1;
}
.import input[type="file"] {
  display: none;
}

/* Small screens */
@media (max-width: 520px) {
  .row {
    grid-template-columns: 1fr;
  }
  .swatch {
    width: 100%;
  }
}
</style>
