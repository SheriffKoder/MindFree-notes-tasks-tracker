/**
 * @file entities/note/mutations/post-note.ts
 * Client fetchers for lazy note creation.
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
): Promise<PostNoteResponse> {
  const response = await fetch("/api/notes/calendar", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, ...values }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to create calendar note.");
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
