// src/composables/useExportImport.ts
import { useModuleSettingsStore } from "../stores/moduleSettings.store";
import { useUserStateStore } from "../stores/userState.store";
import { useThemeStore } from "../stores/themeStore";

// If your Notes/Tasks stores have different names, adjust these imports:
import { useNotesStore } from "../stores/notes.store";
import { useTasksStore } from "../stores/tasks.store";

/* ---------- Types ---------- */

type BaseExport = {
  version: 1;
  createdAt: string;
  user: {
    displayName: string;
    avatarDataUrl: string | null;
  };
  settings: {
    enabled: Record<string, boolean>;
  };
  modules: {
    notes?: unknown; // store-specific payload
    tasks?: unknown; // store-specific payload
  };
};

export type CoreExport = BaseExport & {
  kind: "grayframe-core";
};

export type FullExport = BaseExport & {
  kind: "grayframe-full";
  theme: {
    mode: "light" | "dark";
    vars: Record<string, string>;
  };
};

type AnyExport = CoreExport | FullExport;

/* ---------- Utils ---------- */

function downloadJson(filename: string, data: object) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function isFullExport(x: unknown): x is FullExport {
  return !!x && typeof x === "object" && (x as any).kind === "grayframe-full";
}

function isCoreLike(x: unknown): x is CoreExport | FullExport {
  return (
    !!x &&
    typeof x === "object" &&
    ((x as any).kind === "grayframe-core" ||
      (x as any).kind === "grayframe-full")
  );
}

/* ---------- Builders ---------- */

/** Build the "core" payload (User + Modules only; excludes theme/colors). */
function buildCore(): CoreExport {
  const settings = useModuleSettingsStore();
  const user = useUserStateStore();
  const notes = useNotesStore();
  const tasks = useTasksStore();

  return {
    kind: "grayframe-core",
    version: 1,
    createdAt: new Date().toISOString(),
    user: {
      displayName: user.displayName,
      avatarDataUrl: user.avatarDataUrl,
    },
    settings: {
      enabled: { ...settings.enabled },
    },
    modules: {
      // Prefer store-defined serializers if present
      notes:
        typeof (notes as any).toJSON === "function"
          ? (notes as any).toJSON()
          : { ...(notes as any) },
      tasks:
        typeof (tasks as any).toJSON === "function"
          ? (tasks as any).toJSON()
          : { ...(tasks as any) },
    },
  };
}

/** Build the "full" payload (legacy/optional: includes theme). */
function buildFull(): FullExport {
  const core = buildCore();
  const theme = useThemeStore();

  return {
    ...core,
    kind: "grayframe-full",
    theme: {
      mode: theme.mode,
      vars: { ...theme.vars },
    },
  };
}

/* ---------- Public API ---------- */

export function useExportImport() {
  const settings = useModuleSettingsStore();
  const user = useUserStateStore();
  const notes = useNotesStore();
  const tasks = useTasksStore();
  const theme = useThemeStore();

  /**
   * Export ONLY User + Modules (no theme/colors).
   */
  async function exportCore() {
    const payload = buildCore();
    downloadJson(
      `grayframe-core-${new Date().toISOString().slice(0, 10)}.json`,
      payload
    );
  }

  /**
   * Import ONLY User + Modules (no theme/colors).
   * Accepts both "core" and "full" files but ignores theme if present.
   */
  async function importCore(file: File) {
    const text = await file.text();
    const data = JSON.parse(text) as Partial<AnyExport>;

    if (!isCoreLike(data)) {
      throw new Error("Not a GrayFrame export.");
    }

    // user
    if (data.user) {
      if (typeof data.user.displayName === "string") {
        user.setName(data.user.displayName);
      }
      if (
        typeof data.user.avatarDataUrl === "string" ||
        data.user.avatarDataUrl === null
      ) {
        if (data.user.avatarDataUrl) user.setAvatar(data.user.avatarDataUrl);
        else user.clearAvatar();
      }
    }

    // settings
    if (data.settings?.enabled) {
      Object.entries(data.settings.enabled).forEach(([k, v]) => {
        settings.setEnabled(k as any, !!v);
      });
    }

    // modules
    if (data.modules) {
      if (data.modules.notes !== undefined) {
        if (typeof (notes as any).fromJSON === "function") {
          (notes as any).fromJSON(data.modules.notes);
        } else {
          Object.assign(notes as any, data.modules.notes);
        }
      }
      if (data.modules.tasks !== undefined) {
        if (typeof (tasks as any).fromJSON === "function") {
          (tasks as any).fromJSON(data.modules.tasks);
        } else {
          Object.assign(tasks as any, data.modules.tasks);
        }
      }
    }
  }

  /**
   * Legacy: Export EVERYTHING (User + Modules + Theme).
   */
  async function exportAll() {
    const payload = buildFull();
    downloadJson(
      `grayframe-full-${new Date().toISOString().slice(0, 10)}.json`,
      payload
    );
  }

  /**
   * Legacy: Import EVERYTHING (User + Modules + Theme).
   * Theme is applied only if present (i.e., from a full export).
   */
  async function importAll(file: File) {
    const text = await file.text();
    const data = JSON.parse(text) as Partial<AnyExport>;

    // Always rehydrate core first
    await importCore(new File([text], file.name, { type: file.type }));

    // Theme only if this is a full export
    if (isFullExport(data)) {
      const t = data.theme;
      if (t && (t.mode === "light" || t.mode === "dark") && t.vars) {
        theme.importTheme({ mode: t.mode, vars: { ...t.vars } } as any);
      }
    }
  }

  return {
    // preferred API for the Data card
    exportCore,
    importCore,

    // legacy / full backup
    exportAll,
    importAll,
  };
}
