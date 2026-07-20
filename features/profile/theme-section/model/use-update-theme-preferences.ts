/**
 * @file features/profile/theme-section/model/use-update-theme-preferences.ts
 * Persist theme preference patches and preview light/dark via next-themes.
 *
 * Full custom CSS var application lands in Step 9 (`apply-theme`).
 */

"use client";

import { useTheme } from "next-themes";

import {
  useUpdatePreferencesMutation,
  type PreferencesPatch,
  type TextContrastMode,
  type ThemeMode,
} from "@/entities/profile/client";

/**
 * Wraps preferences mutation with helpers for theme fields.
 * Applies an immediate `next-themes` preview for light / dark / custom base.
 */
export function useUpdateThemePreferences() {
  const mutation = useUpdatePreferencesMutation();
  const { setTheme } = useTheme();

  function previewThemeMode(
    themeMode: ThemeMode,
    textContrastMode: TextContrastMode,
  ) {
    if (themeMode === "custom") {
      setTheme(textContrastMode);
      return;
    }

    setTheme(themeMode);
  }

  function updatePreferences(
    patch: PreferencesPatch,
    preview?: { themeMode: ThemeMode; textContrastMode: TextContrastMode },
  ) {
    if (preview) {
      previewThemeMode(preview.themeMode, preview.textContrastMode);
    }

    mutation.mutate(patch);
  }

  return {
    errorMessage:
      mutation.error instanceof Error ? mutation.error.message : null,
    isPending: mutation.isPending,
    updatePreferences,
  };
}
