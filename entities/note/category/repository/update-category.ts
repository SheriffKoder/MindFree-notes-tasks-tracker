/**
 * @file entities/note/category/repository/update-category.ts
 * Partial updates for one note category row owned by the user.
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";
import type { UpdateNoteCategoryBody } from "@/entities/note/category/schema";
import { mapNoteCategoryRow } from "@/entities/note/category/transform";
import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Applies a partial update to one category row.
 */
export async function updateCategory(
  userId: string,
  id: string,
  patch: UpdateNoteCategoryBody,
): Promise<NoteCategory | null> {
  const supabase = await createClient();

  const dbPatch: Partial<
    Pick<NoteCategoryRow, "name" | "show_on_home" | "sort_order">
  > = {};

  if (patch.name !== undefined) {
    dbPatch.name = patch.name;
  }

  if (patch.showOnHome !== undefined) {
    dbPatch.show_on_home = patch.showOnHome;
  }

  if (patch.sortOrder !== undefined) {
    dbPatch.sort_order = patch.sortOrder;
  }

  const { data, error } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .update(dbPatch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw error;
    }

    throw new Error(`Failed to update note category: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteCategoryRow(data as NoteCategoryRow);
}
