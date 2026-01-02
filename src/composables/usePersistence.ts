/* Pinia persistence plugin: per-store hydrate + debounced saves + noisy errors in dev */
import type { PiniaPluginContext, Store } from "pinia";
import { idbGet, idbSet } from "./useIndexedDb";

const SAVE_DEBOUNCE_MS = 150;

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: number | undefined;
  return ((...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms) as unknown as number;
  }) as T;
}

async function hydrate(store: Store) {
  try {
    const key = store.$id;
    const saved = await idbGet<any>(key);
    if (saved && typeof saved === "object") {
      store.$patch(saved);
      if (import.meta.env.DEV) console.info(`[persist] hydrated ${key}`, saved);
    }
  } catch (err) {
    console.error(`[persist] hydrate failed for ${store.$id}`, err);
  }
}

export function createPersistPlugin() {
  return (ctx: PiniaPluginContext) => {
    const store = ctx.store;
    const key = store.$id;

    // Hydrate this store immediately
    // Note: Pinia plugin can be async-ish; patching after create is safe.
    void hydrate(store);

    // Debounced save on any mutation
    const save = debounce(async () => {
      try {
        // Capture only the state object (exclude actions/getters)
        await idbSet(key, JSON.parse(JSON.stringify(store.$state)));
        if (import.meta.env.DEV) console.info(`[persist] saved ${key}`);
      } catch (err) {
        console.error(`[persist] save failed for ${key}`, err);
      }
    }, SAVE_DEBOUNCE_MS);

    store.$subscribe(
      (_mutation, _state) => {
        save();
      },
      { detached: true } // run even if store not used in active component
    );
  };
}
