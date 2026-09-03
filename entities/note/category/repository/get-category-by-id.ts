/**
 * @file entities/note/category/repository/get-category-by-id.ts
 * Fetches one note category by id for the authenticated user.
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";
import { mapNoteCategoryRow } from "@/entities/note/category/transform";
import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Returns one category row or null when not found for the user.
 */
export async function getCategoryById(
  userId: string,
  id: string,
): Promise<NoteCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch note category: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapNoteCategoryRow(data as NoteCategoryRow);
}
