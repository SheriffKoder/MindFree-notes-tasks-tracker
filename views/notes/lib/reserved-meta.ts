/**
 * @file views/notes/lib/reserved-meta.ts
 * Reserved label value and icon kind for note list cards by view mode.
 *
 * @example Month notes view — reserved shows the calendar date
 * ```ts
 * const note = {
 *   id: "1",
 *   date: "2026-07-09",
 *   title: "July planning",
 *   content: "Ship list view polish.",
 *   starred: false,
 *   isImportant: true,
 *   isQuick: false,
 *   lastEditedAt: "2026-07-09T10:15:00.000Z",
 *   revision: 1,
 * };
 *
 * getReservedMeta("month-notes", note);
 * // => { value: "2026-07-09", kind: "date" }
 * ```
 *
 * @example Category undated view — reserved shows the note title
 * ```ts
 * getReservedMeta("category:uuid", note);
 * // => { value: "July priorities", kind: "file" }
 * ```
 *
 * @example Calendar view — no reserved metadata
 * ```ts
 * getReservedMeta("calendar", note);
 * // => {}
 * ```
 */

import type { Note } from "@/entities/note";
import {
  isCategoryNotesView,
  type NotesViewId,
} from "@/views/notes/lib/notes-views";

/** View modes that supply reserved label metadata for {@link NoteListCard}. */
export type ReservedMetaContext = NotesViewId | "home";

/**
 * Reserved metadata shown below/on note list cards.
 *
 * @example
 * ```ts
 * { value: "2026-07-09", kind: "date" }   // month-notes
 * { value: "July priorities", kind: "file" } // category:<id>
 * {}                                     // calendar
 * ```
 */
export type ReservedMeta = {
  /** Label text shown beside the reserved icon (date or title). */
  value?: string;
  /** Icon kind: calendar for month notes, file for category undated notes. */
  kind?: "date" | "file";
};

/**
 * Resolves the reserved display string for a note in the active view.
 *
 * @param view - active Notes page view
 * @param note - note row
 * @returns reserved label text, if any
 */
export function getReservedValue(
  view: ReservedMetaContext,
  note: Note,
): string | undefined {
  if (view === "month-notes") {
    return note.date ?? undefined;
  }

  if (view === "home") {
    return note.date ?? (note.title || undefined);
  }

  // Category undated panes show the title (same as former general-notes)
  if (view !== "calendar" && isCategoryNotesView(view)) {
    return note.title || undefined;
  }

  return undefined;
}

/**
 * Resolves reserved label text and icon kind for a note list card.
 *
 * @param view - active Notes page view
 * @param note - note row
 * @returns reserved value and icon kind for {@link NoteListCard}
 */
export function getReservedMeta(
  view: ReservedMetaContext,
  note: Note,
): ReservedMeta {
  if (view === "month-notes") {
    return { value: getReservedValue(view, note), kind: "date" };
  }

  if (view === "home") {
    if (note.date) {
      return { value: note.date, kind: "date" };
    }

    return { value: note.title || undefined, kind: "file" };
  }

  if (view !== "calendar" && isCategoryNotesView(view)) {
    return { value: getReservedValue(view, note), kind: "file" };
  }

  return {};
}
