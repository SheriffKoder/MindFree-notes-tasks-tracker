/**
 * @file entities/note/category/mutations/create-note-category.ts
 * Server use-case for creating a user-managed note category.
 */

import { CategoryNameConflictError } from "@/entities/note/category/errors";
import type { NoteCategory } from "@/entities/note/category/model/types";
import { createCategory } from "@/entities/note/category/repository";
import { createNoteCategoryBodySchema } from "@/entities/note/category/schema";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

/**
 * Validates the body and inserts a non-default category.
 */
export async function createNoteCategory(
  userId: string,
  body: unknown,
): Promise<NoteCategory> {
  const parsed = createNoteCategoryBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid note category payload.");
  }

  try {
    return await createCategory(userId, parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CategoryNameConflictError();
    }

    throw error;
  }
}
