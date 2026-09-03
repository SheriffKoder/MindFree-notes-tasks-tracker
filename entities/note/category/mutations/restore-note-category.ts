/**
 * @file entities/note/category/mutations/restore-note-category.ts
 * Server use-case for restoring a soft-deleted note category.
 */

import { CategoryNameConflictError } from "@/entities/note/category/errors";
import type { NoteCategory } from "@/entities/note/category/model/types";
import { restoreCategory } from "@/entities/note/category/repository";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

/**
 * Restores an archived category, surfacing name conflicts with active rows.
 */
export async function restoreNoteCategory(
  userId: string,
  id: string,
): Promise<NoteCategory> {
  try {
    const restored = await restoreCategory(userId, id);

    if (!restored) {
      throw new Error("Category not found.");
    }

    return restored;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CategoryNameConflictError();
    }

    throw error;
  }
}
