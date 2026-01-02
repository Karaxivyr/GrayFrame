// Local-first export/import of app state (no external deps)
import { APP_VERSION } from "../constants/app.constants";
import { useModuleSettingsStore } from "../stores/moduleSettings.store";
import { useNotesStore } from "../stores/notes.store";
import { useTasksStore } from "../stores/tasks.store";
import { useAppMetaStore } from "../stores/appMeta.store";
import { useUserStateStore } from "../stores/userState.store";
import type { ModuleSettings } from "../types/settings.types";
import type { Note } from "../types/notes.types";
import type { Task } from "../types/task.types";

type BackupShape = {
  version: string;
  exportedAt: number;
  stores: {
    moduleSettings: ModuleSettings; // enabled only
    notes: { items: Note[] };
    tasks: { items: Task[] };
    appMeta: { theme: "light" | "dark" };
    userState: { displayName: string; avatarDataUrl: string | null };
  };
};

export function useExportImport() {
  const settings = useModuleSettingsStore();
  const notes = useNotesStore();
  const tasks = useTasksStore();
  const meta = useAppMetaStore();
  const user = useUserStateStore();

  function exportAll() {
    const payload: BackupShape = {
      version: APP_VERSION,
      exportedAt: Date.now(),
      stores: {
        moduleSettings: { enabled: { ...settings.enabled } },
        notes: { items: [...notes.items] },
        tasks: { items: [...tasks.items] },
        appMeta: { theme: meta.theme },
        userState: {
          displayName: user.displayName,
          avatarDataUrl: user.avatarDataUrl,
        },
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = URL.createObjectURL(blob);
    a.download = `creator-dashboard-backup-${ts}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importAll(file: File) {
    const text = await file.text();
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== "object") throw new Error("Invalid backup file");

    const data = raw as Partial<BackupShape>;
    if (!data.stores || typeof data.stores !== "object")
      throw new Error("Invalid backup file: missing stores");
    const s = data.stores;

    if (s.moduleSettings && s.moduleSettings.enabled) {
      settings.$patch({ enabled: { ...s.moduleSettings.enabled } });
    }
    if (s.notes && Array.isArray(s.notes.items)) {
      notes.$patch({ items: s.notes.items as Note[] });
    }
    if (s.tasks && Array.isArray(s.tasks.items)) {
      tasks.$patch({ items: s.tasks.items as Task[] });
    }
    if (
      s.appMeta &&
      (s.appMeta.theme === "light" || s.appMeta.theme === "dark")
    ) {
      meta.$patch({ theme: s.appMeta.theme });
    }
    if (s.userState && typeof s.userState.displayName === "string") {
      user.$patch({
        displayName: s.userState.displayName,
        avatarDataUrl: s.userState.avatarDataUrl ?? null,
      });
    }
    return true;
  }

  return { exportAll, importAll };
}
