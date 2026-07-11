/**
 * @file entities/note/editor/lib/format-calendar-note-title.ts
 * Display title helpers for calendar-dated notes.
 *
 * Purpose: Keep calendar note titles aligned with their ISO date label.
 * Used in: entities/note/editor/*, pre-save-orchestrator/evaluate-note-save.ts
 * Used for: Picker prefill, payload normalization, and date-binding detection.
 *
 * Exports:
 * - formatCalendarNoteTitle: human-readable title from `YYYY-MM-DD`
 * - isDateFormattedTitle: whether the title still matches that formatted label
 */

import { formatDayAriaLabel } from "@/shared/calendar";

/**
 * Formats the drawer title for a calendar note from its ISO date.
 *
 * @param isoDate - `YYYY-MM-DD`
 * @returns human-readable date used as the calendar note title
 */
export function formatCalendarNoteTitle(isoDate: string): string {
  return formatDayAriaLabel(isoDate);
}

/**
 * @returns whether the title still matches the formatted calendar date label.
 */
export function isDateFormattedTitle(title: string, isoDate: string): boolean {
  return title.trim() === formatCalendarNoteTitle(isoDate);
}
