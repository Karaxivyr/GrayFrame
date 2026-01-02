export type NoteId = string;

export interface Note {
  id: NoteId;
  title: string;
  body: string;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}
