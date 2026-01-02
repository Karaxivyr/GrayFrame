import { defineStore } from "pinia";
import type { Note } from "../types/notes.types";

export const useNotesStore = defineStore("notes", {
  state: () => ({
    items: [] as Note[],
  }),
  getters: {
    count: (s) => s.items.length,
    byUpdatedDesc: (s) =>
      [...s.items].sort(
        (a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
      ),
  },
  actions: {
    create(payload: Omit<Note, "id">) {
      const id = crypto.randomUUID();
      const now = Date.now();
      const note: Note = {
        id,
        title: payload.title ?? "",
        body: payload.body ?? "",
        createdAt: payload.createdAt ?? now,
        updatedAt: payload.updatedAt ?? payload.createdAt ?? now,
      };
      this.items.push(note);
      return id;
    },

    // Only allows title/body patches per your earlier signature
    update(id: string, patch: Partial<Pick<Note, "title" | "body">>) {
      const idx = this.items.findIndex((n) => n.id === id);
      if (idx < 0) return;

      const prev = this.items[idx]!; // tell TS it's not undefined

      const next: Note = {
        id: prev.id,
        title: patch.title ?? prev.title,
        body: patch.body ?? prev.body,
        createdAt: prev.createdAt,
        updatedAt: Date.now(),
      };

      this.items[idx] = next;
    },

    remove(id: string) {
      this.items = this.items.filter((n) => n.id !== id);
    },

    // Optional helper if you want explicit timestamp bumps
    touch(id: string, when = Date.now()) {
      const n = this.items.find((n) => n.id === id);
      if (n) n.updatedAt = when;
    },
  },
});
