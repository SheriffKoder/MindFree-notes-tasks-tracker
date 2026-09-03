/**
 * @file entities/note/category/mutations/soft-delete-note-category.ts
 * Server use-case for soft-deleting a note category.
 */

import type { NoteCategory } from "@/entities/note/category/model/types";
import { softDeleteCategory } from "@/entities/note/category/repository";

/**
 * Soft-deletes a category (including Diary). Archived rows are hidden from views.
 */
export async function softDeleteNoteCategory(
  userId: string,
  id: string,
): Promise<NoteCategory> {
  const deleted = await softDeleteCategory(userId, id);

  if (!deleted) {
    throw new Error("Category not found.");
  }

  return deleted;
}
