/**
 * @file entities/profile/index.ts
 * Shared domain exports — types and pure helpers only.
 *
 * Server reads: `entities/profile/server`
 */

export {
  createDefaultProfileRows,
  DEFAULT_TEXT_CONTRAST_MODE,
  DEFAULT_THEME_MODE,
} from "@/entities/profile/lib/default-profile-values";
export type { DefaultProfileRows } from "@/entities/profile/lib/default-profile-values";

export {
  mapPreferencesRow,
  mapProfileRow,
  mapSecurityRow,
  toProfileAccount,
  toProfilePreferences,
  toProfileSecurity,
} from "@/entities/profile/lib/map-row";

export type {
  Profile,
  ProfileRow,
  TextContrastMode,
  ThemeMode,
  UserPreferences,
  UserPreferencesRow,
  UserSecuritySettings,
  UserSecuritySettingsRow,
} from "@/entities/profile/model/types";

export type {
  ProfileAccount,
  ProfilePageData,
  ProfilePreferences,
  ProfileSecurity,
} from "@/entities/profile/model/read-models";
