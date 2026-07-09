/**
 * @file features/notes/note-list-card/lib/card-style-config.ts
 * Editable style tokens for note list cards.
 */

import type { CSSProperties } from "react";

/**
 * Centralized colors for note list cards.
 * Edit these values to tune card theming.
 */
export const NOTE_LIST_CARD_STYLE_CONFIG = {
  colors: {
    defaultBackground: "var(--color-surface)",
    hoverBackgroundLight:
      "color-mix(in_srgb,var(--color-card-hover)_60%,var(--color-surface))",
    hoverBackgroundDark:
      "color-mix(in_srgb,var(--color-card-hover)_30%,var(--color-surface-secondary))",
    reserved:
      "var(--color-accent)",
    importantAccent:
      "color-mix(in_srgb,var(--color-success)_65%,var(--color-fg-muted))",
    star: "var(--color-accent)",
  },
} as const;

/**
 * CSS variables consumed by card Tailwind classes.
 */
export const NOTE_LIST_CARD_CSS_VARS: CSSProperties = {
  "--note-card-bg-default": NOTE_LIST_CARD_STYLE_CONFIG.colors.defaultBackground,
  "--note-card-hover-light": NOTE_LIST_CARD_STYLE_CONFIG.colors.hoverBackgroundLight,
  "--note-card-hover-dark": NOTE_LIST_CARD_STYLE_CONFIG.colors.hoverBackgroundDark,
  "--note-card-reserved": NOTE_LIST_CARD_STYLE_CONFIG.colors.reserved,
  "--note-card-important-accent": NOTE_LIST_CARD_STYLE_CONFIG.colors.importantAccent,
  "--note-card-star": NOTE_LIST_CARD_STYLE_CONFIG.colors.star,
} as CSSProperties;
