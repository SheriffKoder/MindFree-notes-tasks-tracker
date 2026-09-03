/**
 * @file entities/note/category/queries/get-note-categories-response.ts
 * Read use-case: list note categories for a user.
 */

import type { NoteCategory } from "@/entities/note/category/model/types";
import {
  ensureDefaultCategory,
  getCategories,
} from "@/entities/note/category/repository";

export interface NoteCategoriesResponse {
  categories: NoteCategory[];
}

/**
 * Ensures Diary exists, then returns categories for the user.
 */
export async function getNoteCategoriesResponse(
  userId: string,
  options: { includeDeleted?: boolean } = {},
): Promise<NoteCategoriesResponse> {
  await ensureDefaultCategory(userId);
  const categories = await getCategories(userId, options);
  return { categories };
}
