/**
 * @file entities/note/client.ts
 * Client-side TanStack Query exports for note read caches.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 */

export {
  calendarNotesQueryKey,
  generalNotesQueryKey,
  homeNotesQueryKey,
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
export {
  homeNotesQueryOptions,
  fetchHomeNotes,
  useHomeNotesQuery,
} from "@/entities/note/tanstack/home-notes-query";
export { prefetchCalendarMonth } from "@/entities/note/tanstack/prefetch-calendar-month";
export { prefetchAdjacentCalendarMonths } from "@/entities/note/tanstack/prefetch-adjacent-calendar-months";
export { useUpdateNoteMutation } from "@/entities/note/tanstack/use-update-note-mutation";
export type { UpdateNoteMutationInput } from "@/entities/note/tanstack/use-update-note-mutation";
export { useCreateCalendarNoteMutation } from "@/entities/note/tanstack/use-create-calendar-note-mutation";
export type { CreateCalendarNoteMutationInput } from "@/entities/note/tanstack/use-create-calendar-note-mutation";
export { useCreateGeneralNoteMutation } from "@/entities/note/tanstack/use-create-general-note-mutation";
export type { CreateGeneralNoteMutationInput } from "@/entities/note/tanstack/use-create-general-note-mutation";
export { useDeleteNoteMutation } from "@/entities/note/tanstack/use-delete-note-mutation";
export type { DeleteNoteMutationInput } from "@/entities/note/tanstack/use-delete-note-mutation";
export { useNotesRealtimeSync } from "@/entities/note/tanstack/use-notes-realtime-sync";
export type {
  RealtimeNoteChangePayload,
  UseNotesRealtimeSyncOptions,
} from "@/entities/note/tanstack/use-notes-realtime-sync";
export type {
  CalendarDay,
  CalendarNotesResponse,
  GeneralNotesResponse,
  HomeNotesResponse,
  Note,
} from "@/entities/note/model/types";
