/**
 * @file entities/note/client.ts
 * Client-side TanStack Query exports for note read caches + write mutations.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 *
 * Segment sources (Step 10):
 * - `@/entities/note/client/index` — keys, fetchers, options, prefetch
 * - `@/entities/note/hooks` — read + mutation hooks, realtime sync
 * - model types / read-models
 */

export {
  calendarNotesQueryKey,
  calendarNotesQueryOptions,
  fetchCalendarNotes,
  fetchGeneralNotes,
  fetchHomeNotes,
  generalNotesQueryKey,
  generalNotesQueryOptions,
  homeNotesQueryKey,
  homeNotesQueryOptions,
  prefetchAdjacentCalendarMonths,
  prefetchCalendarMonth,
} from "@/entities/note/client/index";
export {
  useCalendarNotesQuery,
  useCreateCalendarNoteMutation,
  useCreateGeneralNoteMutation,
  useCreateQuickNoteMutation,
  useDeleteNoteMutation,
  useGeneralNotesQuery,
  useHomeNotesQuery,
  useNotesRealtimeSync,
  useUpdateNoteMutation,
} from "@/entities/note/hooks";
export type {
  CreateCalendarNoteMutationInput,
  CreateGeneralNoteMutationInput,
  CreateQuickNoteMutationInput,
  DeleteNoteMutationInput,
  RealtimeNoteChangePayload,
  UpdateNoteMutationInput,
  UseNotesRealtimeSyncOptions,
} from "@/entities/note/hooks";
export type { Note } from "@/entities/note/model/types";
export type {
  CalendarDay,
  CalendarNotesResponse,
  GeneralNotesResponse,
  HomeNotesResponse,
} from "@/entities/note/model/read-models";
