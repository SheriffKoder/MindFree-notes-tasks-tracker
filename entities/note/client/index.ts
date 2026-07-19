/**
 * @file entities/note/client/index.ts
 * Segment barrel for browser note fetchers, keys, options, and prefetch.
 *
 * Function index:
 * - calendarNotesQueryKey, generalNotesQueryKey, homeNotesQueryKey (query-keys)
 * - fetchCalendarNotes, calendarNotesQueryOptions (calendar-notes-query)
 * - fetchGeneralNotes, generalNotesQueryOptions (general-notes-query)
 * - fetchHomeNotes, homeNotesQueryOptions (home-notes-query)
 * - prefetchCalendarMonth, prefetchAdjacentCalendarMonths (prefetch-*)
 * - fetchPost*, fetchPatchNote, fetchDeleteNote (HTTP write fetchers)
 */

export {
  calendarNotesQueryKey,
  generalNotesQueryKey,
  homeNotesQueryKey,
} from "@/entities/note/client/query-keys";
export {
  calendarNotesQueryOptions,
  fetchCalendarNotes,
} from "@/entities/note/client/calendar-notes-query";
export {
  generalNotesQueryOptions,
  fetchGeneralNotes,
} from "@/entities/note/client/general-notes-query";
export {
  homeNotesQueryOptions,
  fetchHomeNotes,
} from "@/entities/note/client/home-notes-query";
export { prefetchCalendarMonth } from "@/entities/note/client/prefetch-calendar-month";
export { prefetchAdjacentCalendarMonths } from "@/entities/note/client/prefetch-adjacent-calendar-months";
export {
  fetchPostCalendarNote,
  fetchPostGeneralNote,
  fetchPostQuickNote,
  type PostNoteResponse,
} from "@/entities/note/client/post-note";
export {
  fetchPatchNote,
  type PatchNoteResponse,
} from "@/entities/note/client/patch-note";
export { fetchDeleteNote } from "@/entities/note/client/delete-note";
