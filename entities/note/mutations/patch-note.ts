/**
 * @file entities/note/mutations/patch-note.ts
 * Client fetcher for PATCH /api/notes/:id.
 *
 * Purpose: Send debounced drawer autosave requests from TanStack mutations.
 * Used in: entities/note/tanstack/use-update-note-mutation.ts
 * Used for: PATCH with optional `date` move and `replaceExistingOnDate` flag.
 *
 * Exports:
 * - fetchPatchNote: JSON PATCH; surfaces 409 conflict metadata on the thrown error
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
 * @param date - target calendar day, or `null` for general (omitted when unchanged)
 * @param replaceExistingOnDate - hard-delete the other note on the target day first
 * @returns server-confirmed note
 */
export async function fetchPatchNote(
  id: string,
  values: NoteFormValues,
  date?: string | null,
  replaceExistingOnDate?: boolean,
): Promise<PatchNoteResponse> {
  const body: NoteFormValues & {
    date?: string | null;
    replaceExistingOnDate?: boolean;
  } = { ...values };

  if (date !== undefined) {
    body.date = date;
  }

  if (replaceExistingOnDate) {
    body.replaceExistingOnDate = true;
  }

  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      conflictingNoteId?: string;
    } | null;
    const error = new Error(
      errorBody?.error ?? "Failed to update note.",
    ) as Error & {
      conflictingNoteId?: string;
      status?: number;
    };
    error.status = response.status;

    if (errorBody?.conflictingNoteId) {
      error.conflictingNoteId = errorBody.conflictingNoteId;
    }

    throw error;
  }

  return response.json() as Promise<PatchNoteResponse>;
}
