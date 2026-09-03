/**
 * @file entities/note/category/repository/restore-category.ts
 * Restores a soft-deleted note category by clearing `deleted_at`.
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";
import { mapNoteCategoryRow } from "@/entities/note/category/transform";
import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Clears `deleted_at` on the category row and returns the restored row.
 */
export async function restoreCategory(
  userId: string,
  id: string,
): Promise<NoteCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw error;
    }

    throw new Error(`Failed to restore note category: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteCategoryRow(data as NoteCategoryRow);
}
