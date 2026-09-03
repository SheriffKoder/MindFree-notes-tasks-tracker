/**
 * @file entities/note/category/repository/hard-delete-category.ts
 * Permanently deletes a note category row (child notes cascade in the DB).
 */

import { NOTE_CATEGORIES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Hard-deletes one category row owned by the user.
 */
export async function hardDeleteCategory(
  userId: string,
  id: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(NOTE_CATEGORIES_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to hard-delete note category: ${error.message}`);
  }

  return Boolean(data);
}
