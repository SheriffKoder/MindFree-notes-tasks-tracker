/**
 * @file entities/note/client/patch-note.ts
 * Client fetcher for PATCH /api/notes/:id.
 *
 * Purpose: Send debounced drawer autosave requests from TanStack mutations.
 * Used in: entities/note/hooks/use-update-note-mutation.ts
 * Used for: PATCH with optional `date` move and `replaceExistingOnDate` flag.
 */

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note/model/types";

export interface PatchNoteResponse {
  note: Note;
}

export const STALE_WRITE_ERROR_CODE = "STALE_WRITE" as const;

export type PatchNoteError = Error & {
  conflictingNoteId?: string;
  status?: number;
  code?: typeof STALE_WRITE_ERROR_CODE;
  note?: Note;
};

/**
 * Sends a debounced autosave PATCH for one existing note.
 *
 * @param id - note row id
 * @param values - full editable form snapshot
 * @param expectedRevision - last server-confirmed revision this write is based on
 * @param date - target calendar day, or `null` for general (omitted when unchanged)
 * @param replaceExistingOnDate - hard-delete the other note on the target day first
 * @returns server-confirmed note
 */
export async function fetchPatchNote(
  id: string,
  values: NoteFormValues,
  expectedRevision: number,
  date?: string | null,
  replaceExistingOnDate?: boolean,
  isQuick?: boolean,
): Promise<PatchNoteResponse> {
  const body: NoteFormValues & {
    date?: string | null;
    isQuick?: boolean;
    replaceExistingOnDate?: boolean;
    expectedRevision: number;
  } = {
    ...values,
    expectedRevision,
  };

  if (date !== undefined) {
    body.date = date;
  }

  if (isQuick !== undefined) {
    body.isQuick = isQuick;
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
      code?: string;
      note?: Note;
    } | null;
    const error = new Error(
      errorBody?.error ?? "Failed to update note.",
    ) as PatchNoteError;
    error.status = response.status;

    if (errorBody?.conflictingNoteId) {
      error.conflictingNoteId = errorBody.conflictingNoteId;
    }

    if (errorBody?.code === STALE_WRITE_ERROR_CODE && errorBody.note) {
      error.code = STALE_WRITE_ERROR_CODE;
      error.note = errorBody.note;
    }

    throw error;
  }

  return response.json() as Promise<PatchNoteResponse>;
}
