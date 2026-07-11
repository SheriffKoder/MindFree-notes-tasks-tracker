/**
 * @file entities/note/mutations/patch-note.ts
 * Client fetcher for PATCH /api/notes/:id.
 */

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note/model/types";

export interface PatchNoteResponse {
  note: Note;
}

/**
 * Sends a debounced autosave PATCH for one existing note.
 *
 * @param id - note row id
 * @param values - full editable form snapshot
 * @returns server-confirmed note
 */
export async function fetchPatchNote(
  id: string,
  values: NoteFormValues,
): Promise<PatchNoteResponse> {
  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to update note.");
  }

  return response.json() as Promise<PatchNoteResponse>;
}
