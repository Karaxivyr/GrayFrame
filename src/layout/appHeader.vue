<template>
  <header class="app-header" role="banner">
    <div class="container">
      <div class="bar">
        <div class="identity" aria-label="Welcome">
          <span class="avatar">
            <img v-if="avatar" :src="avatar" :alt="displayName + ' avatar'" />
            <span v-else class="placeholder" aria-hidden="true">{{
              initials
            }}</span>
          </span>
          <span class="welcome">
            <span class="muted">Welcome,</span>
            <strong class="name">{{ displayName }}</strong>
          </span>
        </div>

        <nav class="nav" aria-label="Primary">
          <router-link
            class="link"
            to="/"
            :class="{ active: $route.name === 'overview' }"
            >Overview</router-link
          >
          <router-link
            class="link"
            to="/settings"
            :class="{ active: $route.name === 'settings' }"
            >Settings</router-link
          >
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStateStore } from "../stores/userState.store";

const user = useUserStateStore();
/* UI fallback only; store can be empty string now */
const displayName = computed(() =>
  user.displayName?.trim() ? user.displayName.trim() : "Creator"
);
const avatar = computed(() => user.avatarDataUrl);
const initials = computed(() => {
  const n = displayName.value;
  const [a = "", b = ""] = n.split(/\s+/);
  return (a[0] || "C").toUpperCase() + (b[0] || "").toUpperCase();
});
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--panel) 85%, transparent);
  backdrop-filter: saturate(1.05) blur(6px);
}

.bar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
}

.identity {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  user-select: none;
  cursor: default;
  min-width: 0;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--panel-subtle);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  font-weight: 700;
  opacity: 0.78;
  font-size: 0.9rem;
}
.welcome {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  min-width: 0;
}
.muted {
  opacity: 0.7;
  font-size: 0.92rem;
}
.name {
  font-weight: 700;
  max-width: 22ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Nav — no hover/active highlights */
.nav {
  display: inline-flex;
  gap: 1rem;
}
.link {
  text-decoration: none;
  color: inherit;
  opacity: 0.9;
  padding: 0.25rem 0.25rem;
  border-radius: 8px;
}
.link:hover,
.link.active {
  opacity: 0.9;
} /* remove underline/hover bg entirely */

@media (max-width: 560px) {
  .muted {
    display: none;
  }
  .name {
    max-width: 14ch;
  }
}
</style>
