/**
 * @file features/notes/note-calendar-cell/ui/note-calendar-hover-content.tsx
 * Rich peek body for a calendar day note inside the shared cursor tooltip.
 */

import { Bookmark, Star } from "lucide-react";

import type { CalendarDay } from "@/entities/note";
import { formatCalendarNoteTitle } from "@/entities/note/editor/lib/format-calendar-note-title";
import { NOTE_CALENDAR_CELL_CSS_VARS } from "@/features/notes/note-calendar-cell/lib/cell-style-config";

export interface NoteCalendarHoverContentProps {
  day: CalendarDay;
}

/**
 * Whether a calendar day has peekable note content for the hover tip.
 */
export function noteCalendarDayHasHoverContent(day: CalendarDay): boolean {
  const note = day.note;

  if (!note) {
    return false;
  }

  return Boolean(note.content.trim() || note.title.trim());
}

/**
 * Full-day note peek: date header, flags, and untrimmed body (shell scrolls).
 */
export function NoteCalendarHoverContent({
  day,
}: NoteCalendarHoverContentProps) {
  const note = day.note;

  if (!note) {
    return null;
  }

  const title = note.title.trim() || formatCalendarNoteTitle(day.date);
  const body = note.content.trim();
  const isImportant = note.isImportant === true;
  const isStarred = note.starred === true;

  return (
    <div style={NOTE_CALENDAR_CELL_CSS_VARS} className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-caption [color:var(--color-fg-muted)]">
            {formatCalendarNoteTitle(day.date)}
          </p>
          {title !== formatCalendarNoteTitle(day.date) ? (
            <p className="truncate text-sm font-medium [color:var(--color-fg)]">
              {title}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
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
      </div>

      {body ? (
        <p className="whitespace-pre-wrap break-words text-sm [color:var(--color-fg)] [overflow-wrap:anywhere]">
          {body}
        </p>
      ) : (
        <p className="text-sm italic [color:var(--color-fg-muted)]">No content</p>
      )}
    </div>
  );
}
