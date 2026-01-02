import { onMounted, onBeforeUnmount } from "vue";

type Handler = (e: KeyboardEvent) => void;

export function useHotkeys(map: Record<string, Handler>) {
  const handler = (e: KeyboardEvent) => {
    // Ignore when typing in inputs/textareas/contenteditable
    const t = e.target as HTMLElement | null;
    if (t) {
      const tag = t.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || t.isContentEditable) return;
    }

    const key = normalize(e);
    const fn = map[key];
    if (fn) {
      fn(e);
      e.preventDefault();
    }
  };

  onMounted(() => window.addEventListener("keydown", handler));
  onBeforeUnmount(() => window.removeEventListener("keydown", handler));
}

function normalize(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.metaKey) parts.push("meta");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  parts.push(e.key.toLowerCase());
  return parts.join("+");
}
