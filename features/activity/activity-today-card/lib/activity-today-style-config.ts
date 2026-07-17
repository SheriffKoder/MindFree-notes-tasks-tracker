/**
 * @file features/activity/activity-today-card/lib/today-card-style-config.ts
 * Editable style tokens for Home Today activity rows.
 *
 * Rows are cards in behavior, list-rows in appearance: no border, no resting
 * background, hover-tinted only. Edit this block to tune density/theming in one
 * place (mirrors features/notes/note-calendar-cell/lib/cell-style-config.ts).
 */

import type { CSSProperties } from "react";

/**
 * Centralized colors for Home Today activity rows.
 * Edit these values to tune row theming.
 */
export const ACTIVITY_TODAY_CARD_STYLE_CONFIG = {
  colors: {
    hoverBackgroundLight:
      "color-mix(in_srgb,var(--color-card-hover)_60%,var(--color-surface))",
    hoverBackgroundDark:
      "color-mix(in_srgb,var(--color-card-hover)_30%,var(--color-surface-secondary))",
    title: "var(--color-fg)",
    /** Dimmed leading chevron + stepper. */
    dim: "var(--color-fg-hint)",
    /** Percent color fallback when the activity has no color. */
    taskColorFallback: "var(--color-accent)",
  },
} as const;

/**
 * CSS variables consumed by Home Today row Tailwind classes.
 */
export const ACTIVITY_TODAY_CARD_CSS_VARS: CSSProperties = {
  "--today-card-hover-light":
    ACTIVITY_TODAY_CARD_STYLE_CONFIG.colors.hoverBackgroundLight,
  "--today-card-hover-dark":
    ACTIVITY_TODAY_CARD_STYLE_CONFIG.colors.hoverBackgroundDark,
  "--today-card-title": ACTIVITY_TODAY_CARD_STYLE_CONFIG.colors.title,
  "--today-card-dim": ACTIVITY_TODAY_CARD_STYLE_CONFIG.colors.dim,
} as CSSProperties;
