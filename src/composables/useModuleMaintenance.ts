// src/composables/useModuleMaintenance.ts
// Module stats + per-module clear helpers using safe ESM dynamic imports.
// No Node 'require', no compile complaints in Vite/ESM.

type MaybeDate = Date | null | undefined;

/** Lazy-load Notes store if it exists. */
async function getNotesStoreSafe(): Promise<any | null> {
  try {
    const mod = await import("../stores/notes.store");
    if (typeof (mod as any).useNotesStore === "function") {
      return (mod as any).useNotesStore();
    }
  } catch {}
  return null;
}

/** Lazy-load Tasks store if it exists. */
async function getTasksStoreSafe(): Promise<any | null> {
  try {
    const mod = await import("../stores/tasks.store");
    if (typeof (mod as any).useTasksStore === "function") {
      return (mod as any).useTasksStore();
    }
  } catch {}
  return null;
}

export function useModuleMaintenance() {
  /** ----- NOTES STATS / CLEAR ----- */
  async function notesStats(): Promise<{ count: number; lastEdited?: Date }> {
    const s = await getNotesStoreSafe();
    if (!s) return { count: 0 };

    const arr =
      (Array.isArray(s.notes) && s.notes) ||
      (Array.isArray(s.items) && s.items) ||
      (Array.isArray(s.list) && s.list) ||
      [];

    let lastEdited: MaybeDate = null;
    for (const it of arr) {
      const d: MaybeDate =
        (it?.updatedAt && new Date(it.updatedAt)) ||
        (it?.updated && new Date(it.updated)) ||
        (it?.modifiedAt && new Date(it.modifiedAt)) ||
        null;
      if (d && !isNaN(d.getTime())) {
        if (!lastEdited || d > lastEdited) lastEdited = d;
      }
    }
    return { count: arr.length, lastEdited: lastEdited ?? undefined };
  }

  async function clearNotesData(): Promise<void> {
    const s = await getNotesStoreSafe();
    if (!s) return;

    if (typeof s.clearAll === "function") {
      await s.clearAll();
      return;
    }
    if (typeof s.resetAll === "function") {
      await s.resetAll();
      return;
    }

    if (Array.isArray(s.notes)) s.notes = [];
    if (Array.isArray(s.items)) s.items = [];
    if (Array.isArray(s.list)) s.list = [];

    if (typeof s.$reset === "function") s.$reset();
  }

  /** ----- TASKS STATS / CLEAR ----- */
  async function tasksStats(): Promise<{
    total: number;
    open: number;
    nextDue?: Date;
  }> {
    const s = await getTasksStoreSafe();
    if (!s) return { total: 0, open: 0 };

    const arr =
      (Array.isArray(s.tasks) && s.tasks) ||
      (Array.isArray(s.items) && s.items) ||
      (Array.isArray(s.list) && s.list) ||
      [];

    let open = 0;
    let nextDue: MaybeDate = null;
    for (const t of arr) {
      const done = !!(t?.completed ?? t?.done ?? t?.isDone);
      if (!done) open++;
      const d: MaybeDate =
        (t?.due && new Date(t.due)) ||
        (t?.dueAt && new Date(t.dueAt)) ||
        (t?.deadline && new Date(t.deadline)) ||
        null;
      if (d && !isNaN(d.getTime())) {
        if (!nextDue || d < nextDue) nextDue = d;
      }
    }
    return { total: arr.length, open, nextDue: nextDue ?? undefined };
  }

  async function clearTasksData(): Promise<void> {
    const s = await getTasksStoreSafe();
    if (!s) return;

    if (typeof s.clearAll === "function") {
      await s.clearAll();
      return;
    }
    if (typeof s.resetAll === "function") {
      await s.resetAll();
      return;
    }

    if (Array.isArray(s.tasks)) s.tasks = [];
    if (Array.isArray(s.items)) s.items = [];
    if (Array.isArray(s.list)) s.list = [];

    if (typeof s.$reset === "function") s.$reset();
  }

  return { notesStats, clearNotesData, tasksStats, clearTasksData };
}
