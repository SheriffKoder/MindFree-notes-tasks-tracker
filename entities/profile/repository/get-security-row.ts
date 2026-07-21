/**
 * @file entities/profile/repository/get-security-row.ts
 * Reads the owned `mf_user_security_settings` row (RLS-scoped).
 */

import { mapSecurityRow } from "@/entities/profile/lib/map-row";
import type {
  UserSecuritySettings,
  UserSecuritySettingsRow,
} from "@/entities/profile/model/types";
import { USER_SECURITY_SETTINGS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches security settings for `userId`.
 *
 * Includes `appPasswordHash` for server use — never return this to the client.
 *
 * @param userId - authenticated user id
 * @returns domain security settings, or `null` when missing
 */
export async function getSecurityRow(
  userId: string,
): Promise<UserSecuritySettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(USER_SECURITY_SETTINGS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user security settings: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapSecurityRow(data as UserSecuritySettingsRow);
}
