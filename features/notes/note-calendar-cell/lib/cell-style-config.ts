/**
 * @file features/notes/note-calendar-cell/lib/cell-style-config.ts
 * Editable style tokens for note calendar cells.
 */

import type { CSSProperties } from "react";

/**
 * Centralized colors for calendar day cells.
 * Edit these values to tune calendar cell theming.
 */
export const NOTE_CALENDAR_CELL_STYLE_CONFIG = {
  colors: {
    defaultBackground: "var(--color-surface)",
    hoverBackgroundLight:
      "color-mix(in_srgb,var(--color-card-hover)_60%,var(--color-surface))",
    hoverBackgroundDark:
      "color-mix(in_srgb,var(--color-card-hover)_30%,var(--color-surface-secondary))",
    defaultBorder: "var(--color-border)",
    selectedBorder: "var(--color-accent)",
    selectedBackground: "var(--color-cal-selected)",
    importantIcon: "var(--color-cal-important)",
    starIcon: "var(--color-accent)",
    todayCircleBackground: "var(--color-accent)",
    todayCircleText: "var(--color-bg)",
    previewText: "var(--color-fg-muted)",
    dayNumber: "var(--color-fg)",
    dayNumberMuted: "var(--color-fg-muted)",
  },
} as const;

/**
 * CSS variables consumed by calendar cell Tailwind classes.
 */
export const NOTE_CALENDAR_CELL_CSS_VARS: CSSProperties = {
  "--note-cell-bg-default":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.defaultBackground,
  "--note-cell-hover-light":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.hoverBackgroundLight,
  "--note-cell-hover-dark":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.hoverBackgroundDark,
  "--note-cell-border-default":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.defaultBorder,
  "--note-cell-border-selected":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.selectedBorder,
  "--note-cell-bg-selected":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.selectedBackground,
  "--note-cell-important-icon":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.importantIcon,
  "--note-cell-star-icon": NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.starIcon,
  "--note-cell-today-bg":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.todayCircleBackground,
  "--note-cell-today-fg": NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.todayCircleText,
  "--note-cell-preview": NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.previewText,
  "--note-cell-day-number":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.dayNumber,
  "--note-cell-day-number-muted":
    NOTE_CALENDAR_CELL_STYLE_CONFIG.colors.dayNumberMuted,
} as CSSProperties;
