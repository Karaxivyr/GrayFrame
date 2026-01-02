// App constants for storage/versioning/routes
export const APP_NAME = "Creator Dashboard";
export const APP_VERSION = "0.1.0-lean-v1";

// IndexedDB
export const IDB_NAME = "creator-dashboard";
export const IDB_VERSION = 1;
export const IDB_STORE_PINIA = "pinia";

// Pinia persist keys (namespace all stores)
export const PERSIST_NAMESPACE = "cd";
export const PERSIST_KEY = (storeId: string) =>
  `${PERSIST_NAMESPACE}:${storeId}` as const;

// Routes
export const ROUTE_OVERVIEW = "/";
export const ROUTE_SETTINGS = "/settings";
