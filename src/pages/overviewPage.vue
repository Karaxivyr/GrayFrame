<template>
  <section class="page container overview">
    <div class="stack">
      <!-- Spacer below the appHeader specifically for the Dashboard -->
      <div class="dash-spacer" aria-hidden="true"></div>

      <!-- Focal: read-only dashboard summary -->
      <dashboard-module />

      <!-- Interactive modules below (shown only if enabled) -->
      <notes-module v-if="enabled.notes" />
      <tasks-module v-if="enabled.tasks" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DashboardModule from "../modules/dashboard/dashboardModule.vue";
import NotesModule from "../modules/notes/notesModule.vue";
import TasksModule from "../modules/tasks/tasksModule.vue";
import { useModuleSettingsStore } from "../stores/moduleSettings.store";

const settings = useModuleSettingsStore();
const enabled = computed(() => settings.enabled);
</script>

<style scoped>
/* Dedicated vertical breathing room below the sticky header, for Dashboard */
.dash-spacer {
  height: var(--space-4);
}
@media (min-width: 960px) {
  .dash-spacer {
    height: var(--space-5);
  }
}

/* Keep the vertical rhythm consistent with Settings */
.stack {
  display: grid;
  gap: var(--space-4);
}
</style>
