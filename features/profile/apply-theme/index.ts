/**
 * @file features/profile/apply-theme/index.ts
 * Client-safe public exports for Profile theme application.
 *
 * Server hydration seed: `@/features/profile/apply-theme/server`
 */

export {
  applyCustomThemeVars,
  clearBodyBackgroundImage,
  clearCustomThemeVars,
  composeDrawerBackground,
} from "@/features/profile/apply-theme/lib/apply-custom-theme-vars";
export { isSafeImageUrl } from "@/features/profile/apply-theme/lib/is-safe-image-url";
export { resolveAccentForeground } from "@/features/profile/apply-theme/lib/resolve-accent-foreground";
export {
  NEXT_THEMES_STORAGE_KEY,
  THEME_PREFERENCES_STORAGE_KEY,
  readThemePreferencesSnapshot,
  resolveBaseThemeClass,
  toThemePreferencesSnapshot,
  writeThemePreferencesSnapshot,
  type ThemePreferencesSnapshot,
} from "@/features/profile/apply-theme/lib/theme-storage";
export { ProfileThemeApplier } from "@/features/profile/apply-theme/ui/profile-theme-applier";
