/**
 * @file entities/profile/model/preferences-patch.ts
 * Client/server-safe partial patch for preference updates (pre-Zod parse).
 */

import type {
  TextContrastMode,
  ThemeMode,
} from "@/entities/profile/model/types";

/**
 * Partial preference fields sent to PATCH /api/profile/preferences.
 * Kept separate from Zod output so optional transforms do not force keys.
 */
export type PreferencesPatch = {
  themeMode?: ThemeMode;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  drawerBackgroundColor?: string | null;
  drawerBackgroundOpacity?: number | null;
  textContrastMode?: TextContrastMode;
  accentColor?: string | null;
  exportEmail?: string;
};
