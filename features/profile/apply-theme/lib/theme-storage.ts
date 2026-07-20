/**
 * @file features/profile/apply-theme/lib/theme-storage.ts
 * Persist a client-side snapshot of theme preferences for pre-paint boot.
 */

import type { ProfilePreferences } from "@/entities/profile/model/read-models";
import type {
  TextContrastMode,
  ThemeMode,
} from "@/entities/profile/model/types";
import { resolveAccentForeground } from "@/features/profile/apply-theme/lib/resolve-accent-foreground";

/** localStorage key for the last-applied profile theme snapshot. */
export const THEME_PREFERENCES_STORAGE_KEY = "mindfree-profile-theme";

/**
 * next-themes default storage key — kept in sync so its boot script matches ours.
 */
export const NEXT_THEMES_STORAGE_KEY = "theme";

/** Snapshot fields needed to paint theme before React hydrates. */
export interface ThemePreferencesSnapshot {
  themeMode: ThemeMode;
  textContrastMode: TextContrastMode;
  accentColor: string | null;
  /** Precomputed so the blocking boot script need not parse colors. */
  accentForeground: string | null;
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  drawerBackgroundColor: string | null;
  drawerBackgroundOpacity: number | null;
}

/**
 * Resolves the next-themes base class (`light` | `dark`) from preferences.
 */
export function resolveBaseThemeClass(
  themeMode: ThemeMode,
  textContrastMode: TextContrastMode,
): "light" | "dark" {
  return themeMode === "custom" ? textContrastMode : themeMode;
}

/**
 * Builds a localStorage snapshot from live preferences.
 */
export function toThemePreferencesSnapshot(
  preferences: ProfilePreferences,
): ThemePreferencesSnapshot {
  return {
    themeMode: preferences.themeMode,
    textContrastMode: preferences.textContrastMode,
    accentColor: preferences.accentColor,
    accentForeground: preferences.accentColor
      ? resolveAccentForeground(preferences.accentColor)
      : null,
    backgroundColor: preferences.backgroundColor,
    backgroundImageUrl: preferences.backgroundImageUrl,
    drawerBackgroundColor: preferences.drawerBackgroundColor,
    drawerBackgroundOpacity: preferences.drawerBackgroundOpacity,
  };
}

/**
 * Reads the cached theme snapshot, or `null` when missing / invalid.
 */
export function readThemePreferencesSnapshot(): ThemePreferencesSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(THEME_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ThemePreferencesSnapshot>;
    if (
      parsed.themeMode !== "light" &&
      parsed.themeMode !== "dark" &&
      parsed.themeMode !== "custom"
    ) {
      return null;
    }

    if (
      parsed.textContrastMode !== "light" &&
      parsed.textContrastMode !== "dark"
    ) {
      return null;
    }

    return {
      themeMode: parsed.themeMode,
      textContrastMode: parsed.textContrastMode,
      accentColor: parsed.accentColor ?? null,
      accentForeground: parsed.accentForeground ?? null,
      backgroundColor: parsed.backgroundColor ?? null,
      backgroundImageUrl: parsed.backgroundImageUrl ?? null,
      drawerBackgroundColor: parsed.drawerBackgroundColor ?? null,
      drawerBackgroundOpacity:
        typeof parsed.drawerBackgroundOpacity === "number"
          ? parsed.drawerBackgroundOpacity
          : parsed.drawerBackgroundOpacity === null
            ? null
            : null,
    };
  } catch {
    return null;
  }
}

/**
 * Writes the theme snapshot and syncs next-themes' storage key.
 */
export function writeThemePreferencesSnapshot(
  preferences: ProfilePreferences,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot = toThemePreferencesSnapshot(preferences);
  const base = resolveBaseThemeClass(
    snapshot.themeMode,
    snapshot.textContrastMode,
  );

  try {
    window.localStorage.setItem(
      THEME_PREFERENCES_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
    window.localStorage.setItem(NEXT_THEMES_STORAGE_KEY, base);
  } catch {
    // Quota / private mode — paint still works from the live applier.
  }
}
