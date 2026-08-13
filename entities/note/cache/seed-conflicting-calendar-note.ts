/**
 * @file entities/note/cache/seed-conflicting-calendar-note.ts
 * Seeds a same-day conflict occupant into TanStack calendar cache after a 409.
 *
 * Purpose: Stop create/patch loops when the client cache missed an existing day note.
 * Used in: features/notes/note-drawer/pre-save-orchestrator/use-pre-save-orchestrator.ts
 * Used for: Upsert occupant from 409 payload, or invalidate the month when missing.
 */

import type { QueryClient } from "@tanstack/react-query";

import { upsertNoteInOwnerCaches } from "@/entities/note/cache/synchronize-note-caches";
import { calendarNotesQueryKey } from "@/entities/note/client/query-keys";
import type { CalendarNotesResponse } from "@/entities/note/model/read-models";
import type { Note } from "@/entities/note/model/types";

/**
 * Ensures the conflicting calendar note is visible to `findNoteOnDate` / date-mode resolve.
 *
 * Prefers upserting the 409 `note` payload. When the month cache is empty or the
 * occupant body is missing, invalidates the month so an active query refetches.
 */
export function seedConflictingCalendarNoteInCache(
  queryClient: QueryClient,
  date: string,
  conflictingNote?: Note | null,
): void {
  const month = date.slice(0, 7);
  const queryKey = calendarNotesQueryKey(month);

  if (conflictingNote) {
    const current = queryClient.getQueryData<CalendarNotesResponse>(queryKey);

    if (current) {
      upsertNoteInOwnerCaches(queryClient, conflictingNote);
      return;
    }
  }

  void queryClient.invalidateQueries({ queryKey });
}
