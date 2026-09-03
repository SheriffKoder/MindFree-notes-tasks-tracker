/**
 * @file entities/note/category/repository/soft-delete-category.ts
 * Soft-deletes a note category by setting `deleted_at`.
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";
import { mapNoteCategoryRow } from "@/entities/note/category/transform";
import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Sets `deleted_at` on the category row and returns the updated row.
 */
export async function softDeleteCategory(
  userId: string,
  id: string,
): Promise<NoteCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to soft-delete note category: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteCategoryRow(data as NoteCategoryRow);
}
