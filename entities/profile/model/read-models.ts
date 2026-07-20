/**
 * @file entities/profile/model/read-models.ts
 * Client-safe Profile page read models (no password hash).
 */

import type {
  TextContrastMode,
  ThemeMode,
} from "@/entities/profile/model/types";

/** Account slice shown on Profile. */
export interface ProfileAccount {
  displayName: string;
  /** Auth email (source of truth); `mf_profiles.email` is a mirror. */
  email: string;
}

/** Preferences slice — accent applies in every theme mode. */
export interface ProfilePreferences {
  themeMode: ThemeMode;
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  drawerBackgroundColor: string | null;
  drawerBackgroundOpacity: number | null;
  textContrastMode: TextContrastMode;
  accentColor: string | null;
  exportEmail: string;
}

/** Security slice for the client — never includes the password hash. */
export interface ProfileSecurity {
  appLockEnabled: boolean;
}

/** Full Profile page payload for SSR / GET /api/profile. */
export interface ProfilePageData {
  account: ProfileAccount;
  preferences: ProfilePreferences;
  security: ProfileSecurity;
}
