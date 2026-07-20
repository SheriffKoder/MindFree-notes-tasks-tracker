/**
 * @file entities/profile/lib/map-row.ts
 * Maps Supabase rows to domain objects for the Profile domain.
 */

import type {
  Profile,
  ProfileRow,
  UserPreferences,
  UserPreferencesRow,
  UserSecuritySettings,
  UserSecuritySettingsRow,
} from "@/entities/profile/model/types";
import type {
  ProfileAccount,
  ProfilePreferences,
  ProfileSecurity,
} from "@/entities/profile/model/read-models";

/**
 * Maps an `mf_profiles` row to the domain {@link Profile}.
 */
export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps an `mf_user_preferences` row to the domain {@link UserPreferences}.
 */
export function mapPreferencesRow(row: UserPreferencesRow): UserPreferences {
  return {
    userId: row.user_id,
    themeMode: row.theme_mode,
    backgroundColor: row.background_color,
    backgroundImageUrl: row.background_image_url,
    drawerBackgroundColor: row.drawer_background_color,
    drawerBackgroundOpacity:
      row.drawer_background_opacity === null
        ? null
        : Number(row.drawer_background_opacity),
    textContrastMode: row.text_contrast_mode,
    accentColor: row.accent_color,
    exportEmail: row.export_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps an `mf_user_security_settings` row to {@link UserSecuritySettings}.
 * Callers must not expose `appPasswordHash` to the client.
 */
export function mapSecurityRow(
  row: UserSecuritySettingsRow,
): UserSecuritySettings {
  return {
    userId: row.user_id,
    appLockEnabled: row.app_lock_enabled,
    appPasswordHash: row.app_password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Account read-model slice from a domain profile (+ optional auth email override). */
export function toProfileAccount(
  profile: Profile,
  authEmail?: string,
): ProfileAccount {
  return {
    displayName: profile.displayName,
    email: authEmail ?? profile.email,
  };
}

/** Preferences read-model slice (no timestamps / userId). */
export function toProfilePreferences(
  preferences: UserPreferences,
): ProfilePreferences {
  return {
    themeMode: preferences.themeMode,
    backgroundColor: preferences.backgroundColor,
    backgroundImageUrl: preferences.backgroundImageUrl,
    drawerBackgroundColor: preferences.drawerBackgroundColor,
    drawerBackgroundOpacity: preferences.drawerBackgroundOpacity,
    textContrastMode: preferences.textContrastMode,
    accentColor: preferences.accentColor,
    exportEmail: preferences.exportEmail,
  };
}

/** Security read-model slice — hash intentionally omitted. */
export function toProfileSecurity(
  security: UserSecuritySettings,
): ProfileSecurity {
  return {
    appLockEnabled: security.appLockEnabled,
  };
}
