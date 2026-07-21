/**
 * @file entities/profile/lib/default-profile-values.ts
 * Canonical insert defaults for profile seed (mirror `006_profile.sql` trigger).
 *
 * When defaults change, update this file and `supabase/migrations/006_profile.sql`.
 */

import type {
  ProfileRow,
  TextContrastMode,
  ThemeMode,
  UserPreferencesRow,
  UserSecuritySettingsRow,
} from "@/entities/profile/model/types";

/** Default `theme_mode` — matches SQL trigger. */
export const DEFAULT_THEME_MODE: ThemeMode = "dark";

/** Default `text_contrast_mode` — matches SQL trigger. */
export const DEFAULT_TEXT_CONTRAST_MODE: TextContrastMode = "dark";

/**
 * Insert payloads for the three profile tables (snake_case for Supabase).
 * Omits `created_at` / `updated_at` so the DB defaults apply.
 */
export interface DefaultProfileRows {
  profile: Pick<ProfileRow, "id" | "display_name" | "email">;
  preferences: Omit<UserPreferencesRow, "created_at" | "updated_at">;
  security: Omit<UserSecuritySettingsRow, "created_at" | "updated_at">;
}

/**
 * Builds conflict-safe insert payloads matching the signup trigger defaults.
 *
 * @param userId - `auth.users.id`
 * @param email - auth email (also used for `export_email`)
 */
export function createDefaultProfileRows(
  userId: string,
  email: string,
): DefaultProfileRows {
  const seedEmail = email || "";

  return {
    profile: {
      id: userId,
      display_name: "",
      email: seedEmail,
    },
    preferences: {
      user_id: userId,
      theme_mode: DEFAULT_THEME_MODE,
      background_color: null,
      background_image_url: null,
      drawer_background_color: null,
      drawer_background_opacity: null,
      text_contrast_mode: DEFAULT_TEXT_CONTRAST_MODE,
      accent_color: null,
      export_email: seedEmail,
    },
    security: {
      user_id: userId,
      app_lock_enabled: false,
      app_password_hash: null,
    },
  };
}
