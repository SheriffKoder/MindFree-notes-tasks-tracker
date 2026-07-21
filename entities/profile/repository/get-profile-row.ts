/**
 * @file entities/profile/repository/get-profile-row.ts
 * Reads the owned `mf_profiles` row (RLS-scoped).
 */

import { mapProfileRow } from "@/entities/profile/lib/map-row";
import type { Profile, ProfileRow } from "@/entities/profile/model/types";
import { PROFILES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches the profile for `userId`.
 *
 * @param userId - authenticated user id (`mf_profiles.id`)
 * @returns domain profile, or `null` when missing
 */
export async function getProfileRow(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapProfileRow(data as ProfileRow);
}
