/**
 * @file entities/note/category/repository/ensure-default-category.ts
 * Idempotently ensures the seeded Diary category exists for a user.
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";
import { mapNoteCategoryRow } from "@/entities/note/category/transform";
import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Returns the user's default Diary category, inserting it when missing.
 */
export async function ensureDefaultCategory(
  userId: string,
): Promise<NoteCategory> {
  const supabase = await createClient();

  const { data: existing, error: selectError } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (selectError) {
    throw new Error(
      `Failed to fetch default note category: ${selectError.message}`,
    );
  }

  if (existing) {
    return mapNoteCategoryRow(existing as NoteCategoryRow);
  }

  const { data: inserted, error: insertError } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .insert({
      user_id: userId,
      name: "Diary",
      show_on_home: true,
      sort_order: 0,
      is_default: true,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(
      `Failed to seed default note category: ${insertError.message}`,
    );
  }

  return mapNoteCategoryRow(inserted as NoteCategoryRow);
}
