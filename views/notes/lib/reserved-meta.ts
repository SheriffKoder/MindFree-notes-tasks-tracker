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
 * };
 *
 * getReservedMeta("month-notes", note);
 * // => { value: "2026-07-09", kind: "date" }
 * ```
 *
 * @example General notes view — reserved shows the note title
 * ```ts
 * const note = {
 *   id: "2",
 *   date: null,
 *   title: "July priorities",
 *   content: "Keep drawer navigation independent from month URL state.",
 *   starred: true,
 *   isImportant: false,
 *   isQuick: false,
 *   lastEditedAt: "2026-07-08T13:30:00.000Z",
 * };
 *
 * getReservedMeta("general-notes", note);
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
import type { NotesViewId } from "@/shared/view-switcher";

/**
 * Reserved metadata shown below/on note list cards.
 *
 * @example
 * ```ts
 * { value: "2026-07-09", kind: "date" }   // month-notes
 * { value: "July priorities", kind: "file" } // general-notes
 * {}                                     // calendar
 * ```
 */
export type ReservedMeta = {
  /** Label text shown beside the reserved icon (date or title). */
  value?: string;
  /** Icon kind: calendar for month notes, file for general notes. */
  kind?: "date" | "file";
};

/**
 * Resolves the reserved display string for a note in the active view.
 *
 * @param view - active Notes page view
 * @param note - note row
 * @returns reserved label text, if any
 *
 * @example
 * ```ts
 * getReservedValue("month-notes", { date: "2026-07-09", title: "..." });
 * // => "2026-07-09"
 *
 * getReservedValue("general-notes", { date: null, title: "July priorities" });
 * // => "July priorities"
 * ```
 */
export function getReservedValue(view: NotesViewId, note: Note): string | undefined {
  if (view === "month-notes") {
    return note.date ?? undefined;
  }

  if (view === "general-notes") {
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
 *
 * @example
 * ```ts
 * // month-notes → calendar icon + ISO date
 * getReservedMeta("month-notes", note);
 * // { value: "2026-07-09", kind: "date" }
 *
 * // general-notes → file icon + title
 * getReservedMeta("general-notes", note);
 * // { value: "July priorities", kind: "file" }
 * ```
 */
export function getReservedMeta(view: NotesViewId, note: Note): ReservedMeta {
  if (view === "month-notes") {
    return { value: getReservedValue(view, note), kind: "date" };
  }

  if (view === "general-notes") {
    return { value: getReservedValue(view, note), kind: "file" };
  }

  return {};
}
