/**
 * @file features/profile/apply-theme/lib/apply-custom-theme-vars.ts
 * Applies Profile preferences to `documentElement` / `body` CSS vars and classes.
 */

import type { ProfilePreferences } from "@/entities/profile/model/read-models";
import { isSafeImageUrl } from "@/features/profile/apply-theme/lib/is-safe-image-url";
import { resolveAccentForeground } from "@/features/profile/apply-theme/lib/resolve-accent-foreground";

const CUSTOM_VAR_NAMES = [
  "--custom-bg",
  "--custom-drawer-bg",
  "--custom-accent",
  "--custom-accent-fg",
  "--custom-fg",
] as const;

/**
 * Composes drawer background with optional opacity via `color-mix`.
 */
export function composeDrawerBackground(
  color: string,
  opacity: number | null,
): string {
  if (opacity == null || opacity >= 1) {
    return color;
  }

  const clamped = Math.min(1, Math.max(0, opacity));
  const percent = Math.round(clamped * 100);
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * Clears custom CSS variables from the document root.
 */
export function clearCustomThemeVars(
  root: HTMLElement = document.documentElement,
): void {
  for (const name of CUSTOM_VAR_NAMES) {
    root.style.removeProperty(name);
  }
}

/**
 * Clears body background-image overrides from custom theme.
 */
export function clearBodyBackgroundImage(
  body: HTMLElement = document.body,
): void {
  body.style.backgroundImage = "";
  body.style.backgroundSize = "";
  body.style.backgroundPosition = "";
  body.style.backgroundRepeat = "";
  body.style.backgroundAttachment = "";
}

function quoteCssUrl(url: string): string {
  return `"${url.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Applies a background image when the URL is safe; clears on load failure.
 */
function applyBodyBackgroundImage(url: string | null): void {
  const body = document.body;

  if (!url || !isSafeImageUrl(url)) {
    clearBodyBackgroundImage(body);
    return;
  }

  const trimmed = url.trim();
  const probe = new Image();

  probe.onload = () => {
    body.style.backgroundImage = `url(${quoteCssUrl(trimmed)})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";
  };

  probe.onerror = () => {
    clearBodyBackgroundImage(body);
  };

  probe.src = trimmed;
}

/**
 * Syncs `.theme-custom`, CSS vars, and body background from preferences.
 *
 * - Accent applies in every mode when set.
 * - Surface/image customs apply only in `custom` mode.
 */
export function applyCustomThemeVars(preferences: ProfilePreferences): void {
  const root = document.documentElement;
  const hasAccent = preferences.accentColor != null;
  const isCustom = preferences.themeMode === "custom";
  const useThemeCustom = isCustom || hasAccent;

  clearCustomThemeVars(root);
  clearBodyBackgroundImage();

  root.classList.toggle("theme-custom", useThemeCustom);

  if (hasAccent && preferences.accentColor) {
    root.style.setProperty("--custom-accent", preferences.accentColor);
    root.style.setProperty(
      "--custom-accent-fg",
      resolveAccentForeground(preferences.accentColor),
    );
  }

  if (!isCustom) {
    return;
  }

  if (preferences.backgroundColor) {
    root.style.setProperty("--custom-bg", preferences.backgroundColor);
  }

  if (preferences.drawerBackgroundColor) {
    root.style.setProperty(
      "--custom-drawer-bg",
      composeDrawerBackground(
        preferences.drawerBackgroundColor,
        preferences.drawerBackgroundOpacity,
      ),
    );
  }

  applyBodyBackgroundImage(preferences.backgroundImageUrl);
}
