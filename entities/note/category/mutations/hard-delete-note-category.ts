/**
 * @file entities/note/category/mutations/hard-delete-note-category.ts
 * Server use-case for permanently deleting a note category.
 */

import { DefaultCategoryProtectedError } from "@/entities/note/category/errors";
import {
  getCategoryById,
  hardDeleteCategory,
} from "@/entities/note/category/repository";

/**
 * Hard-deletes a category and cascades child notes. Diary is protected.
 */
export async function hardDeleteNoteCategory(
  userId: string,
  id: string,
): Promise<void> {
  const existing = await getCategoryById(userId, id);

  if (!existing) {
    throw new Error("Category not found.");
  }

  if (existing.isDefault) {
    throw new DefaultCategoryProtectedError();
  }

  const deleted = await hardDeleteCategory(userId, id);

  if (!deleted) {
    throw new Error("Category not found.");
  }
}
