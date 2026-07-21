/**
 * @file entities/profile/repository/update-security-row.ts
 * Partial update for `mf_user_security_settings` (hash only — never plaintext).
 */

import { mapSecurityRow } from "@/entities/profile/lib/map-row";
import type {
  UserSecuritySettings,
  UserSecuritySettingsRow,
} from "@/entities/profile/model/types";
import { USER_SECURITY_SETTINGS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

export interface SecuritySettingsPatch {
  appLockEnabled: boolean;
  appPasswordHash: string | null;
}

/**
 * Replaces app-lock enabled flag and password hash for the owned row.
 *
 * @param userId - authenticated user id
 * @param patch - enabled flag + hash (or `null` when cleared)
 * @returns updated security settings, or `null` when no row matches
 */
export async function updateSecurityByUserId(
  userId: string,
  patch: SecuritySettingsPatch,
): Promise<UserSecuritySettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(USER_SECURITY_SETTINGS_TABLE)
    .update({
      app_lock_enabled: patch.appLockEnabled,
      app_password_hash: patch.appPasswordHash,
    })
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update security settings: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapSecurityRow(data as UserSecuritySettingsRow);
}
