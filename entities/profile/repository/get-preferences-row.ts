/**
 * @file entities/profile/repository/get-preferences-row.ts
 * Reads the owned `mf_user_preferences` row (RLS-scoped).
 */

import { mapPreferencesRow } from "@/entities/profile/lib/map-row";
import type {
  UserPreferences,
  UserPreferencesRow,
} from "@/entities/profile/model/types";
import { USER_PREFERENCES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches preferences for `userId`.
 *
 * @param userId - authenticated user id
 * @returns domain preferences, or `null` when missing
 */
export async function getPreferencesRow(
  userId: string,
): Promise<UserPreferences | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(USER_PREFERENCES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user preferences: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapPreferencesRow(data as UserPreferencesRow);
}
