/* Tiny IndexedDB helper with graceful fallback to localStorage on failure */
type KV = { key: string; value: unknown };

const DB_NAME = "creatorDashboard";
const STORE_NAME = "pinia";
const DB_VERSION = 1;

function supported() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!supported()) return reject(new Error("IndexedDB not supported"));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
    req.onblocked = () =>
      console.warn(
        "[IDB] Open blocked (another tab may be holding old version)."
      );
  });
}

async function withStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  return tx.objectStore(STORE_NAME);
}

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  try {
    const store = await withStore("readonly");
    return await new Promise<T | undefined>((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(`cd:${key}`);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  }
}

export async function idbSet<T = unknown>(
  key: string,
  value: T
): Promise<void> {
  try {
    const store = await withStore("readwrite");
    await new Promise<void>((resolve, reject) => {
      const req = store.put({ key, value } as KV);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Fallback to localStorage
    try {
      localStorage.setItem(`cd:${key}`, JSON.stringify(value));
    } catch {}
  }
}

export async function idbDel(key: string): Promise<void> {
  try {
    const store = await withStore("readwrite");
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      localStorage.removeItem(`cd:${key}`);
    } catch {}
  }
}

export async function idbClear(): Promise<void> {
  try {
    const store = await withStore("readwrite");
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // best effort
    Object.keys(localStorage).forEach(
      (k) => k.startsWith("cd:") && localStorage.removeItem(k)
    );
  }
}
