/**
 * @file entities/note/queries/get-general-notes-response.ts
 * Read use-case: all general notes for the authenticated user.
 */

import type { GeneralNotesResponse } from "@/entities/note/model/types";
import { getGeneralNotes } from "@/entities/note/repository/note-repository";

/**
 * Fetches every general note (`date IS NULL`, `is_quick = false`).
 *
 * Used by `GET /api/notes/general` and any server code that needs the same payload.
 *
 * @returns general notes response
 */
export async function getGeneralNotesResponse(): Promise<GeneralNotesResponse> {
  const generalNotes = await getGeneralNotes();

  return { generalNotes };
}
