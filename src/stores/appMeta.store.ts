import { defineStore } from "pinia";
import { APP_VERSION } from "../constants/app.constants";

export type ThemeMode = "light" | "dark";

export const useAppMetaStore = defineStore("appMeta", {
  state: () => ({
    version: APP_VERSION as string,
    theme: "light" as ThemeMode,
    firstRunComplete: false as boolean,
  }),

  actions: {
    setTheme(mode: ThemeMode) {
      this.theme = mode;
    },
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
    },
    markFirstRunComplete() {
      this.firstRunComplete = true;
    },
  },
});
