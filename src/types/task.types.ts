export type TaskId = string;
export type TaskStatus = "todo" | "done";

export interface Task {
  id: TaskId;
  title: string;
  status: TaskStatus;
  dueAt?: number; // epoch ms (optional)
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}
