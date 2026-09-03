/**
 * @file entities/note/category/repository/create-category.ts
 * Inserts a user-managed note category (`is_default` is always false).
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";
import type { CreateNoteCategoryBody } from "@/entities/note/category/schema";
import { mapNoteCategoryRow } from "@/entities/note/category/transform";
import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

async function resolveNextSortOrder(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve category sort order: ${error.message}`);
  }

  const currentMax = (data as Pick<NoteCategoryRow, "sort_order"> | null)
    ?.sort_order;

  return currentMax === undefined ? 0 : currentMax + 1;
}

/**
 * Inserts a non-default category for the user.
 */
export async function createCategory(
  userId: string,
  payload: CreateNoteCategoryBody,
): Promise<NoteCategory> {
  const supabase = await createClient();
  const sortOrder =
    payload.sortOrder ?? (await resolveNextSortOrder(userId));

  const { data, error } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .insert({
      user_id: userId,
      name: payload.name,
      show_on_home: payload.showOnHome,
      sort_order: sortOrder,
      is_default: false,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw error;
    }

    throw new Error(`Failed to create note category: ${error.message}`);
  }

  return mapNoteCategoryRow(data as NoteCategoryRow);
}
