/**
 * @file entities/note/client.ts
 * Client-side TanStack Query exports for note read caches + write mutations.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 *
 * Segment sources (Step 10):
 * - `@/entities/note/client/index` — keys, fetchers, options, prefetch
 * - `@/entities/note/hooks` — read + mutation hooks, realtime sync
 * - `@/entities/note/category/client` — category keys, hooks, types
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
  noteCategoriesQueryKey,
  noteCategoriesQueryOptions,
  fetchNoteCategories,
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
/////////////////////////////////////////////////////////////
// Category nest — re-exported so views never deep-import category/
/////////////////////////////////////////////////////////////
export {
  useNoteCategoriesQuery,
  useCreateNoteCategoryMutation,
  useUpdateNoteCategoryMutation,
  useSoftDeleteNoteCategoryMutation,
  useRestoreNoteCategoryMutation,
  useHardDeleteNoteCategoryMutation,
  noteCategoriesWithDeletedQueryKey,
  noteCategoriesKeyFor,
  seedNoteCategoriesCache,
} from "@/entities/note/category/client";
export type {
  NoteCategory,
  NoteCategoriesResponse,
  UseNoteCategoriesQueryOptions,
  CreateNoteCategoryMutationInput,
  UpdateNoteCategoryMutationInput,
  SoftDeleteNoteCategoryMutationInput,
  RestoreNoteCategoryMutationInput,
  HardDeleteNoteCategoryMutationInput,
} from "@/entities/note/category/client";
export type { Note } from "@/entities/note/model/types";
export type {
  CalendarDay,
  CalendarNotesResponse,
  GeneralNotesResponse,
  HomeNotesResponse,
  HomeNotesStrip,
} from "@/entities/note/model/read-models";
