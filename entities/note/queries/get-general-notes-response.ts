/**
 * @file entities/note/queries/get-general-notes-response.ts
 * Read use-case: undated notes for one category.
 */

import type { GeneralNotesResponse } from "@/entities/note/model/read-models";
import { getGeneralNotes } from "@/entities/note/repository";

/**
 * Fetches general notes for one category (`date IS NULL`, `is_quick = false`).
 */
export async function getGeneralNotesResponse(
  userId: string,
  categoryId: string,
): Promise<GeneralNotesResponse> {
  const generalNotes = await getGeneralNotes(userId, categoryId);

  return { categoryId, generalNotes };
}
