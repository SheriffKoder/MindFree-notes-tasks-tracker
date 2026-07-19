/**
 * @file features/activity/activity-calendar-cell/lib/cell-style-config.ts
 * Editable style tokens for activity calendar cells and task pills.
 */

import type { CSSProperties } from "react";

/**
 * Centralized colors and layout limits for activity calendar cells.
 * Edit these values to tune calendar cell theming.
 */
export const ACTIVITY_CALENDAR_CELL_STYLE_CONFIG = {
  colors: {
    defaultBackground: "var(--color-surface)",
    hoverBackgroundLight:
      "color-mix(in_srgb,var(--color-card-hover)_60%,var(--color-surface))",
    hoverBackgroundDark:
      "color-mix(in_srgb,var(--color-card-hover)_30%,var(--color-surface-secondary))",
    selectedBorder: "var(--color-accent)",
    selectedBackground: "var(--color-cal-selected)",
    todayCircleBackground: "var(--color-accent)",
    todayCircleText: "var(--color-bg)",
    dayNumber: "var(--color-fg)",
    dayNumberMuted: "var(--color-fg-muted)",
    overflowText: "var(--color-fg-muted)",
    taskColorFallback: "var(--color-accent)",
  },
  pill: {
    /** Opacity applied to the pill's absolute inset background layer. */
    backgroundOpacity: 0.18,
    /** Incomplete tasks render at this opacity multiplier on the whole pill. */
    incompleteOpacity: 0.55,
  },
  layout: {
    /** Max task pills shown before an overflow indicator. */
    maxVisiblePills: 3,
  },
} as const;

/**
 * CSS variables consumed by activity calendar cell Tailwind classes.
 */
export const ACTIVITY_CALENDAR_CELL_CSS_VARS: CSSProperties = {
  "--activity-cell-bg-default":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.defaultBackground,
  "--activity-cell-hover-light":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.hoverBackgroundLight,
  "--activity-cell-hover-dark":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.hoverBackgroundDark,
  "--activity-cell-border-selected":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.selectedBorder,
  "--activity-cell-bg-selected":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.selectedBackground,
  "--activity-cell-today-bg":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.todayCircleBackground,
  "--activity-cell-today-fg":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.todayCircleText,
  "--activity-cell-day-number":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.dayNumber,
  "--activity-cell-day-number-muted":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.dayNumberMuted,
  "--activity-cell-overflow":
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.overflowText,
} as CSSProperties;
