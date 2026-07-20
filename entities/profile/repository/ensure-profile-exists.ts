/**
 * @file entities/profile/repository/ensure-profile-exists.ts
 * Idempotent lazy seed for profile tables (C) — safe when the signup trigger (A) already ran.
 */

import { createDefaultProfileRows } from "@/entities/profile/lib/default-profile-values";
import {
  PROFILES_TABLE,
  USER_PREFERENCES_TABLE,
  USER_SECURITY_SETTINGS_TABLE,
} from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Ensures the three profile rows exist for `userId`.
 *
 * Uses `ON CONFLICT DO NOTHING`-style upserts so concurrent calls and the
 * auth.users signup trigger do not throw or overwrite existing preferences.
 *
 * @param userId - `auth.users.id`
 * @param email - auth email used for profile + export_email defaults
 */
export async function ensureProfileExists(
  userId: string,
  email: string,
): Promise<void> {
  const supabase = await createClient();
  const defaults = createDefaultProfileRows(userId, email);

  const [profileResult, preferencesResult, securityResult] = await Promise.all([
    supabase.from(PROFILES_TABLE).upsert(defaults.profile, {
      onConflict: "id",
      ignoreDuplicates: true,
    }),
    supabase.from(USER_PREFERENCES_TABLE).upsert(defaults.preferences, {
      onConflict: "user_id",
      ignoreDuplicates: true,
    }),
    supabase.from(USER_SECURITY_SETTINGS_TABLE).upsert(defaults.security, {
      onConflict: "user_id",
      ignoreDuplicates: true,
    }),
  ]);

  if (profileResult.error) {
    throw new Error(
      `Failed to ensure profile row: ${profileResult.error.message}`,
    );
  }

  if (preferencesResult.error) {
    throw new Error(
      `Failed to ensure preferences row: ${preferencesResult.error.message}`,
    );
  }

  if (securityResult.error) {
    throw new Error(
      `Failed to ensure security settings row: ${securityResult.error.message}`,
    );
  }
}
