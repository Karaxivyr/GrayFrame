/**
 * Export / import helpers for sharing themes as JSON strings.
 * Keeps things human-readable for copy/paste.
 */
import type { ThemeVars } from "../stores/themeStore";

export type ThemeExport = {
  name?: string;
  mode: "light" | "dark";
  vars: ThemeVars;
};

export function serializeTheme(data: ThemeExport): string {
  return JSON.stringify(data, null, 2);
}

export function parseTheme(json: string): ThemeExport {
  const parsed = JSON.parse(json);
  if (!parsed || (parsed.mode !== "light" && parsed.mode !== "dark")) {
    throw new Error("Invalid theme JSON: missing or bad `mode`.");
  }
  if (!parsed.vars) {
    throw new Error("Invalid theme JSON: missing `vars`.");
  }
  return parsed as ThemeExport;
}
