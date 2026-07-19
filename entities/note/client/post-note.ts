/**
 * @file entities/note/client/post-note.ts
 * Client fetchers for lazy note creation.
 *
 * Purpose: POST new calendar or general notes from TanStack create mutations.
 * Used in: entities/note/hooks/use-create-*-note-mutation.ts
 * Used for: Lazy create with optional same-day replace on calendar POST.
 */

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note/model/types";

export interface PostNoteResponse {
  note: Note;
}

/**
 * Creates a calendar note for one ISO date.
 *
 * @param date - `YYYY-MM-DD`
 * @param values - editable form snapshot
 * @returns server-confirmed note
 */
export async function fetchPostCalendarNote(
  date: string,
  values: NoteFormValues,
  replaceExistingOnDate?: boolean,
): Promise<PostNoteResponse> {
  const body: NoteFormValues & {
    date: string;
    replaceExistingOnDate?: boolean;
  } = { date, ...values };

  if (replaceExistingOnDate) {
    body.replaceExistingOnDate = true;
  }

  const response = await fetch("/api/notes/calendar", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
      conflictingNoteId?: string;
    } | null;
    const error = new Error(
      body?.error ?? "Failed to create calendar note.",
    ) as Error & {
      conflictingNoteId?: string;
      status?: number;
    };
    error.status = response.status;

    if (body?.conflictingNoteId) {
      error.conflictingNoteId = body.conflictingNoteId;
    }

    throw error;
  }

  return response.json() as Promise<PostNoteResponse>;
}

/**
 * Creates a general note (`date IS NULL`).
 *
 * @param values - editable form snapshot
 * @returns server-confirmed note
 */
export async function fetchPostGeneralNote(
  values: NoteFormValues,
): Promise<PostNoteResponse> {
  const response = await fetch("/api/notes/general", {
    method: "POST",
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
    throw new Error(body?.error ?? "Failed to create general note.");
  }

  return response.json() as Promise<PostNoteResponse>;
}

/**
 * Creates a quick note (`date IS NULL`, `is_quick = true`).
 *
 * @param values - editable form snapshot
 * @returns server-confirmed note
 */
export async function fetchPostQuickNote(
  values: NoteFormValues,
): Promise<PostNoteResponse> {
  const response = await fetch("/api/notes/home", {
    method: "POST",
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
    throw new Error(body?.error ?? "Failed to create quick note.");
  }

  return response.json() as Promise<PostNoteResponse>;
}
