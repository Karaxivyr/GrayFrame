import { APP_VERSION } from "../constants/app.constants";
import { useModuleSettingsStore } from "../stores/moduleSettings.store";
import { useNotesStore } from "../stores/notes.store";
import { useTasksStore } from "../stores/tasks.store";
import { useAppMetaStore } from "../stores/appMeta.store";
import { useUserStateStore } from "../stores/userState.store";

// Shape of the backup file (loose on purpose for compatibility)
type BackupShape = {
  version?: string;
  exportedAt?: number;
  stores?: {
    moduleSettings?: { enabled?: Record<"notes" | "tasks", boolean> };
    notes?: { items?: any[] };
    tasks?: { items?: any[] }; // may contain legacy 'doing' or 'inProgress'
    appMeta?: {
      theme?: "light" | "dark";
      accent?: "cyan" | "violet" | "amber" | "emerald";
    };
    userState?: {
      displayName?: string;
      avatarDataUrl?: string | null | undefined;
    };
  };
};

// Normalize ANY incoming status to your current union: 'todo' | 'doing' | 'done'
function normalizeStatus(raw: any): "todo" | "doing" | "done" {
  const v = String(raw ?? "").toLowerCase();
  if (v === "inprogress") return "doing";
  if (v === "doing" || v === "todo" || v === "done") return v as any;
  return "todo";
}

// Build a minimal Task object matching your store’s Task shape
function toTask(raw: any) {
  const now = Date.now();
  return {
    id: typeof raw?.id === "string" ? raw.id : crypto.randomUUID(),
    title: typeof raw?.title === "string" ? raw.title : "",
    status: normalizeStatus(raw?.status), // 'todo' | 'doing' | 'done'
    // omit 'notes' because your Task type doesn't have it
    dueAt: Number.isFinite(raw?.dueAt) ? raw.dueAt : undefined,
    createdAt: Number.isFinite(raw?.createdAt) ? raw.createdAt : now,
    updatedAt: Number.isFinite(raw?.updatedAt) ? raw.updatedAt : now,
  };
}

export function useExportImport() {
  const mod = useModuleSettingsStore();
  const notes = useNotesStore();
  const tasks = useTasksStore();
  const meta = useAppMetaStore();
  const user = useUserStateStore();

  function exportAll() {
    const data: BackupShape = {
      version: APP_VERSION,
      exportedAt: Date.now(),
      stores: {
        moduleSettings: { enabled: { ...mod.enabled } },
        notes: { items: [...notes.items] },
        tasks: { items: [...tasks.items] }, // your current Task[] shape
        appMeta: {
          theme: meta.theme /* accent optional in your current baseline */,
        },
        userState: {
          displayName: user.displayName,
          avatarDataUrl: user.avatarDataUrl ?? undefined,
        },
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creator-dashboard-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importAll(file: File) {
    const txt = await file.text();
    const s: BackupShape = JSON.parse(txt ?? "{}");

    // Modules
    if (s?.stores?.moduleSettings?.enabled) {
      mod.$patch({ enabled: { ...s.stores.moduleSettings.enabled } });
    }

    // Notes (pass-through)
    if (Array.isArray(s?.stores?.notes?.items)) {
      notes.$patch({ items: s.stores.notes.items as any[] });
    }

    // Tasks — normalize legacy statuses + strip unknown fields
    if (Array.isArray(s?.stores?.tasks?.items)) {
      const normalized = s.stores.tasks.items.map(toTask);
      // Cast at boundary so TS doesn't complain if your Task type differs slightly
      tasks.$patch({ items: normalized as unknown as typeof tasks.items });
    }

    // Meta (theme only in your current baseline)
    const theme = s?.stores?.appMeta?.theme;
    if (theme === "light" || theme === "dark") meta.theme = theme;

    // User
    if (s?.stores?.userState) {
      const displayName =
        typeof s.stores.userState.displayName === "string" &&
        s.stores.userState.displayName.trim()
          ? s.stores.userState.displayName
          : "Creator";
      user.$patch({
        displayName,
        avatarDataUrl:
          typeof s.stores.userState.avatarDataUrl === "string"
            ? s.stores.userState.avatarDataUrl
            : null,
      });
    }

    return true;
  }

  return { exportAll, importAll };
}
