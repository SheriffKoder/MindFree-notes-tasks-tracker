/**
 * @file entities/note/category/repository/get-categories.ts
 * Fetches note categories for a user (active only by default).
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";
import { mapNoteCategoryRow } from "@/entities/note/category/transform";
import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches note categories ordered by sort order, then creation time.
 * When `includeDeleted` is true, active rows come before archived rows.
 */
export async function getCategories(
  userId: string,
  options: { includeDeleted?: boolean } = {},
): Promise<NoteCategory[]> {
  const supabase = await createClient();
  let query = supabase.from(NOTE_CATEGORIES_TABLE).select("*").eq("user_id", userId);

  if (!options.includeDeleted) {
    query = query
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
  } else {
    query = query
      .order("deleted_at", { ascending: true, nullsFirst: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch note categories: ${error.message}`);
  }

  return (data as NoteCategoryRow[] | null)?.map(mapNoteCategoryRow) ?? [];
}
