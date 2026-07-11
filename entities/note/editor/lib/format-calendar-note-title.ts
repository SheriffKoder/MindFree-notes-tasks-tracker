/**
 * @file entities/note/editor/lib/format-calendar-note-title.ts
 * Display title for calendar notes — fixed to the note's ISO date.
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
