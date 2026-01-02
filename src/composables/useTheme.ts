import { watchEffect, onMounted } from "vue";
import { useAppMetaStore, type ThemeMode } from "../stores/appMeta.store";

export function useTheme() {
  const app = useAppMetaStore();

  // Apply current theme to <html data-theme="...">
  const apply = (mode: ThemeMode) => {
    document.documentElement.setAttribute("data-theme", mode);
  };

  // Optionally detect system theme on very first run
  const maybeAdoptSystem = () => {
    if (app.firstRunComplete) return;
    try {
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      )?.matches;
      if (prefersDark) app.theme = "dark";
    } catch {
      /* noop */
    }
    app.markFirstRunComplete();
  };

  onMounted(() => {
    maybeAdoptSystem();
    apply(app.theme);
  });

  watchEffect(() => {
    apply(app.theme);
  });

  return {
    theme: () => app.theme,
    setTheme: (mode: ThemeMode) => app.setTheme(mode),
    toggleTheme: () => app.toggleTheme(),
  };
}
