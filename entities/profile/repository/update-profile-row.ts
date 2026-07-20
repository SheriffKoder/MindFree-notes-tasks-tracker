/**
 * @file entities/profile/repository/update-profile-row.ts
 * Partial update for `mf_profiles` (display name).
 */

import { mapProfileRow } from "@/entities/profile/lib/map-row";
import type { Profile, ProfileRow } from "@/entities/profile/model/types";
import { PROFILES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Updates `display_name` for the owned profile row.
 *
 * @param userId - authenticated user id
 * @param displayName - new display name (may be empty)
 * @returns updated profile, or `null` when no row matches
 */
export async function updateProfileDisplayName(
  userId: string,
  displayName: string,
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .update({ display_name: displayName })
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapProfileRow(data as ProfileRow);
}
