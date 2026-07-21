/**
 * @file entities/profile/model/types.ts
 * Domain and database-row types for the Profile domain.
 *
 * Keep defaults in sync with `supabase/migrations/006_profile.sql` and
 * `entities/profile/lib/default-profile-values.ts`.
 */

/** Persisted theme mode (`mf_user_preferences.theme_mode`). */
export type ThemeMode = "light" | "dark" | "custom";

/** Base light/dark class used under `theme_mode = custom`. */
export type TextContrastMode = "light" | "dark";

/**
 * App identity row (`mf_profiles`) as used across the server.
 */
export interface Profile {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Theme + export preferences (`mf_user_preferences`).
 */
export interface UserPreferences {
  userId: string;
  themeMode: ThemeMode;
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  drawerBackgroundColor: string | null;
  drawerBackgroundOpacity: number | null;
  textContrastMode: TextContrastMode;
  accentColor: string | null;
  exportEmail: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * App lock settings (`mf_user_security_settings`).
 * `appPasswordHash` is server-only — never put it in client read models.
 */
export interface UserSecuritySettings {
  userId: string;
  appLockEnabled: boolean;
  appPasswordHash: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Supabase row shape for `mf_profiles` before domain mapping. */
export interface ProfileRow {
  id: string;
  display_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/** Supabase row shape for `mf_user_preferences` before domain mapping. */
export interface UserPreferencesRow {
  user_id: string;
  theme_mode: ThemeMode;
  background_color: string | null;
  background_image_url: string | null;
  drawer_background_color: string | null;
  drawer_background_opacity: number | null;
  text_contrast_mode: TextContrastMode;
  accent_color: string | null;
  export_email: string;
  created_at: string;
  updated_at: string;
}

/** Supabase row shape for `mf_user_security_settings` before domain mapping. */
export interface UserSecuritySettingsRow {
  user_id: string;
  app_lock_enabled: boolean;
  app_password_hash: string | null;
  created_at: string;
  updated_at: string;
}
