<template>
  <div class="app">
    <app-header />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../layout/appHeader.vue";
import { useTheme } from "../composables/useTheme";
import { useHotkeys } from "../composables/useHotkeys";
import { useNotesStore } from "../stores/notes.store";
import { useTasksStore } from "../stores/tasks.store";
import router from "../router";

useTheme();

const notes = useNotesStore();
const tasks = useTasksStore();

/* Global hotkeys (toasts removed)
   n       → new note
   t       → new task
   g s     → go settings   (press 'g', then 's')
   g o     → go overview   (press 'g', then 'o')
   shift+d → toggle theme
*/
let seq: string[] = [];
const seqWindowMs = 800;
let seqTimer: number | null = null;

useHotkeys({
  n: () => {
    notes.create({ title: "Untitled" });
  },
  t: () => {
    tasks.create({ title: "Untitled task" });
  },
  "shift+d": () => {
    const el = document.querySelector(
      'input[name="theme"][value="dark"]'
    ) as HTMLInputElement | null;
    el?.click();
  },
  g: () => {
    seq = ["g"];
    if (seqTimer) window.clearTimeout(seqTimer);
    seqTimer = window.setTimeout(() => (seq = []), seqWindowMs);
  },
  s: () => {
    if (seq[0] === "g") {
      router.push("/settings");
      seq = [];
    }
  },
  o: () => {
    if (seq[0] === "g") {
      router.push("/");
      seq = [];
    }
  },
});
</script>

<style scoped>
.app {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr;
}
.app-main {
  display: block;
}
</style>
