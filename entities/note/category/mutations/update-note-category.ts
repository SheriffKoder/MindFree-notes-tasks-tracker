/**
 * @file entities/note/category/mutations/update-note-category.ts
 * Server use-case for updating a note category.
 */

import { CategoryNameConflictError } from "@/entities/note/category/errors";
import type { NoteCategory } from "@/entities/note/category/model/types";
import { updateCategory } from "@/entities/note/category/repository";
import { updateNoteCategoryBodySchema } from "@/entities/note/category/schema";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

/**
 * Validates the body and applies a partial category update.
 */
export async function updateNoteCategory(
  userId: string,
  id: string,
  body: unknown,
): Promise<NoteCategory> {
  const parsed = updateNoteCategoryBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid note category payload.");
  }

  try {
    const updated = await updateCategory(userId, id, parsed.data);

    if (!updated) {
      throw new Error("Category not found.");
    }

    return updated;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CategoryNameConflictError();
    }

    throw error;
  }
}
