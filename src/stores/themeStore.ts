import { defineStore } from "pinia";

/**
 * Keys map 1:1 to CSS variables in _tokens.scss
 */
export type ThemeVars = {
  /* Brand */
  brandPrimary: string;
  brandSecondary: string;
  accent: string;
  accentContrast: string;

  /* Surfaces */
  bg: string;
  panel: string;
  panelSubtle: string;
  panelElev: string;

  /* Text & borders */
  text: string;
  textMuted: string;
  border: string;

  /* Status */
  ok: string;
  warn: string;
  danger: string;
};

export type ThemeState = {
  // <-- exported
  mode: "light" | "dark";
  vars: ThemeVars;
};

const STORAGE_KEY = "grayframe.theme.v1";

const DEFAULT_LIGHT: ThemeState = {
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

const DEFAULT_DARK: ThemeState = {
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

function pickDefault(mode: "light" | "dark"): ThemeState {
  return JSON.parse(
    JSON.stringify(mode === "dark" ? DEFAULT_DARK : DEFAULT_LIGHT)
  );
}

function applyCssVars(state: ThemeState) {
  const root = document.documentElement;
  root.setAttribute("data-theme", state.mode);
  const map: Record<string, string> = {
    "--brand-primary": state.vars.brandPrimary,
    "--brand-secondary": state.vars.brandSecondary,
    "--accent": state.vars.accent,
    "--accent-contrast": state.vars.accentContrast,

    "--bg": state.vars.bg,
    "--panel": state.vars.panel,
    "--panel-subtle": state.vars.panelSubtle,
    "--panel-elev": state.vars.panelElev,

    "--text": state.vars.text,
    "--text-muted": state.vars.textMuted,
    "--border": state.vars.border,

    "--ok": state.vars.ok,
    "--warn": state.vars.warn,
    "--danger": state.vars.danger,
  };
  for (const [k, v] of Object.entries(map)) {
    root.style.setProperty(k, v);
  }
}

export const useThemeStore = defineStore("theme", {
  state: (): ThemeState => pickDefault("dark"),
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          // First load: let tokens.scss defaults render, then apply our defaults for current mode
          applyCssVars(this.$state);
          return;
        }
        const parsed: ThemeState = JSON.parse(raw);
        this.mode = parsed.mode;
        this.vars = parsed.vars;
        applyCssVars(this.$state);
      } catch {
        // If parse fails, reset gracefully
        this.reset(this.mode);
      }
    },
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state));
      applyCssVars(this.$state);
    },
    setMode(mode: "light" | "dark") {
      this.mode = mode;
      // keep user colors but ensure immediate surface flips are sane
      // If user hasn’t customized, default the surface set to the mode defaults
      const defaults = pickDefault(mode);
      // Merge only surface/text/border if they still equal prior defaults
      const keysToMaybeSwap: (keyof ThemeVars)[] = [
        "bg",
        "panel",
        "panelSubtle",
        "panelElev",
        "text",
        "textMuted",
        "border",
      ];
      for (const k of keysToMaybeSwap) {
        const prevDefaults = pickDefault(mode === "dark" ? "light" : "dark");
        if (this.vars[k] === (prevDefaults.vars as any)[k]) {
          this.vars[k] = (defaults.vars as any)[k];
        }
      }
      this.save();
    },
    setVar<K extends keyof ThemeVars>(key: K, value: ThemeVars[K]) {
      this.vars[key] = value;
      this.save();
    },
    reset(mode?: "light" | "dark") {
      const m = mode ?? this.mode;
      const fresh = pickDefault(m);
      this.mode = fresh.mode;
      this.vars = fresh.vars;
      this.save();
    },
    apply() {
      applyCssVars(this.$state);
    },
    importTheme(payload: ThemeState) {
      this.mode = payload.mode;
      this.vars = payload.vars;
      this.save();
    },
  },
});
