/**
 * @file features/profile/apply-theme/ui/profile-theme-applier.tsx
 * Applies saved Profile preferences app-wide via next-themes + CSS vars.
 *
 * Also mirrors preferences to localStorage so `ThemeBootScriptTag` can paint
 * before React hydrates on the next visit.
 */

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { useProfilePageQuery } from "@/entities/profile/client";
import { applyCustomThemeVars } from "@/features/profile/apply-theme/lib/apply-custom-theme-vars";
import {
  resolveBaseThemeClass,
  writeThemePreferencesSnapshot,
} from "@/features/profile/apply-theme/lib/theme-storage";

/**
 * Syncs next-themes + `.theme-custom` vars whenever profile preferences change.
 * Renders nothing — side-effect only.
 */
export function ProfileThemeApplier() {
  const { data } = useProfilePageQuery();
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !data?.preferences) {
      return;
    }

    const preferences = data.preferences;
    const base = resolveBaseThemeClass(
      preferences.themeMode,
      preferences.textContrastMode,
    );

    setTheme(base);
    applyCustomThemeVars(preferences);
    writeThemePreferencesSnapshot(preferences);
  }, [mounted, data?.preferences, setTheme]);

  return null;
}
