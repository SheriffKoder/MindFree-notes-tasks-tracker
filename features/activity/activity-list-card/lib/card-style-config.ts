/**
 * @file features/activity/activity-list-card/lib/card-style-config.ts
 * Editable style tokens for activity list cards.
 */

import type { CSSProperties } from "react";

/**
 * Centralized colors for activity list cards.
 * Edit these values to tune card theming.
 */
export const ACTIVITY_LIST_CARD_STYLE_CONFIG = {
  colors: {
    defaultBackground: "var(--color-surface)",
    hoverBackgroundLight:
      "color-mix(in_srgb,var(--color-card-hover)_60%,var(--color-surface))",
    hoverBackgroundDark:
      "color-mix(in_srgb,var(--color-card-hover)_30%,var(--color-surface-secondary))",
    title: "var(--color-fg)",
    mutedText: "var(--color-fg-muted)",
    taskColorFallback: "var(--color-accent)",
  },
} as const;

/**
 * CSS variables consumed by activity list card Tailwind classes.
 */
export const ACTIVITY_LIST_CARD_CSS_VARS: CSSProperties = {
  "--activity-card-bg-default":
    ACTIVITY_LIST_CARD_STYLE_CONFIG.colors.defaultBackground,
  "--activity-card-hover-light":
    ACTIVITY_LIST_CARD_STYLE_CONFIG.colors.hoverBackgroundLight,
  "--activity-card-hover-dark":
    ACTIVITY_LIST_CARD_STYLE_CONFIG.colors.hoverBackgroundDark,
  "--activity-card-title": ACTIVITY_LIST_CARD_STYLE_CONFIG.colors.title,
  "--activity-card-muted": ACTIVITY_LIST_CARD_STYLE_CONFIG.colors.mutedText,
} as CSSProperties;
