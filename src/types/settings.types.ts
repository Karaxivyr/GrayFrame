export type ModuleId = "notes" | "tasks";

export interface ModuleSettings {
  enabled: Record<ModuleId, boolean>;
}
