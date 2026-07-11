/**
 * @file features/notes/note-calendar-cell/ui/note-calendar-cell.tsx
 * Note-specific body for an in-month calendar cell.
 */

import { Plus, Bookmark, Star } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { CalendarDay, Note } from "@/entities/note";
import { NOTE_CALENDAR_CELL_CSS_VARS } from "@/features/notes/note-calendar-cell/lib/cell-style-config";

export interface NoteCalendarCellProps {
  /** Prepared calendar day from the month payload. */
  day: CalendarDay;
  /** Whether this day matches the current `selectedDate`. */
  isSelected?: boolean;
  /** Whether this day is today (resolved once per grid render). */
  isToday?: boolean;
}

function getNotePreview(note: Note): string | undefined {
  const title = note.title.trim();

  if (title) {
    return title;
  }

  const content = note.content.trim();

  return content || undefined;
}

/** Skips re-render when `day`, `isSelected`, and `isToday` are unchanged. */
export const NoteCalendarCell = memo(function NoteCalendarCell({
  day,
  isSelected = false,
  isToday = false,
}: NoteCalendarCellProps) {
  const note = day.note;
  const preview = note ? getNotePreview(note) : undefined;
  const isImportant = note?.isImportant === true;
  const isStarred = note?.starred === true;

  return (
    <div
      style={NOTE_CALENDAR_CELL_CSS_VARS}
      className={cn(
        "relative h-20 md:h-24 w-full bg-[var(--note-cell-bg-default)] p-1 transition-colors duration-200 hover:bg-[var(--note-cell-hover-light)] dark:hover:bg-[var(--note-cell-hover-dark)] md:min-h-20",
        isSelected &&
          "bg-[var(--note-cell-bg-selected)] ring-2 ring-inset ring-[var(--note-cell-border-selected)]",
      )}
    >
      <div
        className="pointer-events-none absolute right-1 top-1 flex items-center gap-0.5"
        aria-hidden
      >
        {isImportant ? (
          <Bookmark
            className="h-3.5 w-3.5 [color:var(--note-cell-important-icon)]"
            fill="currentColor"
          />
        ) : null}
        {isStarred ? (
          <Star
            className="h-3.5 w-3.5 [color:var(--note-cell-star-icon)]"
            fill="currentColor"
          />
        ) : null}
      </div>

      <span
        className={cn(
          "pointer-events-none absolute bottom-1 right-1 flex min-w-[1.25rem] items-center justify-center text-caption font-medium leading-none",
          isToday
            ? "size-5 rounded-full bg-[var(--note-cell-today-bg)] [color:var(--note-cell-today-fg)]"
            : preview
              ? "[color:var(--note-cell-day-number)]"
              : "[color:var(--note-cell-day-number-muted)]",
        )}
        aria-hidden
      >
        {day.day}
      </span>

      {preview ? (
        <p className="line-clamp-3 md:line-clamp-5 whitespace-pre-line pb-4 pr-1 text-caption [color:var(--note-cell-preview)]">
          {preview}
        </p>
      ) : (
        <div className="flex h-full items-center justify-center pb-4">
          <Plus
            aria-hidden
            className="h-3 w-3 opacity-20 [color:var(--note-cell-day-number-muted)]"
          />
        </div>
      )}
    </div>
  );
});
