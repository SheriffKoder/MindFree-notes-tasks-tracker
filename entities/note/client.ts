/**
 * @file entities/note/client.ts
 * Client-side TanStack Query exports for note read caches.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 */

export {
  calendarNotesQueryKey,
  generalNotesQueryKey,
} from "@/entities/note/tanstack/query-keys";
export {
  calendarNotesQueryOptions,
  fetchCalendarNotes,
  useCalendarNotesQuery,
} from "@/entities/note/tanstack/calendar-notes-query";
export {
  generalNotesQueryOptions,
  fetchGeneralNotes,
  useGeneralNotesQuery,
} from "@/entities/note/tanstack/general-notes-query";
export { prefetchCalendarMonth } from "@/entities/note/tanstack/prefetch-calendar-month";
export { prefetchAdjacentCalendarMonths } from "@/entities/note/tanstack/prefetch-adjacent-calendar-months";
export { useUpdateNoteMutation } from "@/entities/note/tanstack/use-update-note-mutation";
export type { UpdateNoteMutationInput } from "@/entities/note/tanstack/use-update-note-mutation";
export type {
  CalendarDay,
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
