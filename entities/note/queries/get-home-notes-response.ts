/**
 * @file entities/note/queries/get-home-notes-response.ts
 * Read use-case: Home category strips (quick slot + starred per showOnHome category).
 */

import { ensureDefaultCategory, getCategories } from "@/entities/note/category/repository";
import type {
  HomeNotesResponse,
  HomeNotesStrip,
} from "@/entities/note/model/read-models";
import {
  getQuickNote,
  getStarredNotesForHomeStrip,
} from "@/entities/note/repository";

/**
 * Fetches one Home strip per active showOnHome category (including empty quick slots).
 */
export async function getHomeNotesResponse(
  userId: string,
): Promise<HomeNotesResponse> {
  await ensureDefaultCategory(userId);
  const categories = (await getCategories(userId)).filter(
    (category) => category.showOnHome,
  );

  const strips: HomeNotesStrip[] = await Promise.all(
    categories.map(async (category) => {
      const [quickNote, starredNotes] = await Promise.all([
        getQuickNote(userId, category.id),
        getStarredNotesForHomeStrip(userId, category),
      ]);

      return {
        categoryId: category.id,
        categoryName: category.name,
        isDefault: category.isDefault,
        quickNote,
        starredNotes,
      };
    }),
  );

  return { strips };
}
