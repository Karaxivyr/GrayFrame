// src/composables/useStorageMaintenance.ts
// Manage local site storage (IndexedDB, local/session storage, caches)

export function useStorageMaintenance() {
  /** Delete ALL IndexedDB databases for this origin (best effort). */
  async function wipeIndexedDBAll(): Promise<number> {
    const idb: any = indexedDB as any;

    if (typeof idb.databases === "function") {
      const dbs: Array<{ name?: string | null }> = await idb.databases();
      let count = 0;
      await Promise.all(
        dbs.map(
          (db) =>
            new Promise<void>((resolve) => {
              const name = db?.name;
              if (!name) return resolve();
              const req = indexedDB.deleteDatabase(name);
              req.onsuccess =
                req.onerror =
                req.onblocked =
                  () => {
                    count++;
                    resolve();
                  };
            })
        )
      );
      return count;
    }

    // Fallback attempt (older browsers): try some common names; ignore failures.
    const guesses = [
      "grayframe",
      "grayframe-db",
      "pinia",
      "pinia-db",
      "app-db",
    ];
    await Promise.all(
      guesses.map(
        (name) =>
          new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = req.onerror = req.onblocked = () => resolve();
          })
      )
    );
    return -1;
  }

  /** Wipe all local app data for this origin (best effort). */
  async function wipeAllAppData(): Promise<void> {
    try {
      await wipeIndexedDBAll();
    } catch {}
    try {
      localStorage.clear();
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}
  }

  /** Approximate storage usage/quota (bytes), if supported. */
  async function estimateStorage(): Promise<{
    usage: number;
    quota: number;
  } | null> {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const { usage = 0, quota = 0 } = await navigator.storage.estimate();
        return { usage, quota };
      }
    } catch {}
    return null;
  }

  return { wipeIndexedDBAll, wipeAllAppData, estimateStorage };
}
