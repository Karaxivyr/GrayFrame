import { defineStore } from "pinia";

export type Status = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: Status;
  notes?: string;
  dueAt?: number;
  createdAt: number;
  updatedAt: number;
}

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    items: [] as Task[],
  }),

  getters: {
    count: (s) => s.items.length,
    openCount: (s) => s.items.filter((t) => t.status !== "done").length,
    doneCount: (s) => s.items.filter((t) => t.status === "done").length,
    byUpdatedDesc: (s) =>
      [...s.items].sort(
        (a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
      ),
  },

  actions: {
    /** Create a new task with all required fields populated */
    create(payload: {
      title: string;
      status?: Status;
      notes?: string;
      dueAt?: number;
      createdAt?: number;
      updatedAt?: number;
    }) {
      const id = crypto.randomUUID();
      const now = Date.now();
      const task: Task = {
        id,
        title: payload.title ?? "",
        status: (payload.status ?? "todo") as Status,
        notes: payload.notes,
        dueAt: payload.dueAt,
        createdAt: payload.createdAt ?? now,
        updatedAt: payload.updatedAt ?? payload.createdAt ?? now,
      };
      this.items.push(task);
      return id;
    },

    /** Update only mutable fields; rebuild a full Task object */
    update(
      id: string,
      patch: Partial<Pick<Task, "title" | "status" | "notes" | "dueAt">>
    ) {
      const idx = this.items.findIndex((t) => t.id === id);
      if (idx < 0) return;

      const prev = this.items[idx];
      if (!prev) return; // TS narrow

      const next: Task = {
        id: prev.id,
        title: patch.title ?? prev.title,
        status: (patch.status ?? prev.status) as Status,
        notes: patch.notes ?? prev.notes,
        dueAt: patch.dueAt ?? prev.dueAt,
        createdAt: prev.createdAt,
        updatedAt: Date.now(),
      };

      this.items[idx] = next;
    },

    /** Set status explicitly; rebuild a full Task object */
    setStatus(id: string, status: Status) {
      const idx = this.items.findIndex((t) => t.id === id);
      if (idx < 0) return;

      const prev = this.items[idx];
      if (!prev) return;

      const next: Task = {
        id: prev.id,
        title: prev.title,
        status,
        notes: prev.notes,
        dueAt: prev.dueAt,
        createdAt: prev.createdAt,
        updatedAt: Date.now(),
      };

      this.items[idx] = next;
    },

    /** Remove a task by id */
    remove(id: string) {
      this.items = this.items.filter((t) => t.id !== id);
    },

    /** Optional helper to bump updatedAt */
    touch(id: string, when = Date.now()) {
      const idx = this.items.findIndex((t) => t.id === id);
      if (idx < 0) return;
      const prev = this.items[idx];
      if (!prev) return;

      const next: Task = {
        id: prev.id,
        title: prev.title,
        status: prev.status,
        notes: prev.notes,
        dueAt: prev.dueAt,
        createdAt: prev.createdAt,
        updatedAt: when,
      };

      this.items[idx] = next;
    },
  },
});
