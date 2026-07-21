/**
 * @file features/profile/theme-section/model/use-update-theme-preferences.ts
 * Persist theme preference patches; ProfileThemeApplier applies them app-wide.
 */

"use client";

import {
  useUpdatePreferencesMutation,
  type PreferencesPatch,
} from "@/entities/profile/client";

/**
 * Wraps preferences mutation for theme section fields.
 * Visual application is owned by `ProfileThemeApplier` (reacts to cache updates).
 */
export function useUpdateThemePreferences() {
  const mutation = useUpdatePreferencesMutation();

  function updatePreferences(patch: PreferencesPatch) {
    mutation.mutate(patch);
  }

  return {
    errorMessage:
      mutation.error instanceof Error ? mutation.error.message : null,
    isPending: mutation.isPending,
    updatePreferences,
  };
}
