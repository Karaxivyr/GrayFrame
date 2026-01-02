import { defineStore } from "pinia";
import type { ModuleId, ModuleSettings } from "../types/settings.types";

const DEFAULT_ENABLED: Record<ModuleId, boolean> = {
  notes: true,
  tasks: true,
};

export const useModuleSettingsStore = defineStore("moduleSettings", {
  state: (): ModuleSettings => ({
    enabled: { ...DEFAULT_ENABLED },
  }),

  actions: {
    setEnabled(id: ModuleId, val: boolean) {
      this.enabled[id] = val;
    },
    reset() {
      this.enabled = { ...DEFAULT_ENABLED };
    },
  },
});
