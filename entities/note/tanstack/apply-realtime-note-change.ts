/**
 * @file entities/note/tanstack/apply-realtime-note-change.ts
 * Applies Supabase realtime row events to TanStack note read caches.
 *
 * Purpose: Keep calendar/general caches in sync with remote writes.
 * Used in: entities/note/tanstack/use-notes-realtime-sync.ts
 * Used for: INSERT/UPDATE/DELETE on mf_notes with last_edited_at gating.
 */

import { mapNoteRow } from "@/entities/note/lib/map-note-row";
import {
  relocateNoteInCache,
  removeCalendarNoteFromCache,
  removeGeneralNoteFromCache,
  upsertCalendarNoteInCache,
  upsertGeneralNoteInCache,
} from "@/entities/note/mutations/note-cache-mutations";
import type { Note, NoteRow } from "@/entities/note/model/types";
import { findNoteByIdInCache } from "@/entities/note/lib/find-note-in-cache";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
} from "@/entities/note/tanstack/query-keys";
import { isNoteMutationPending } from "@/entities/note/tanstack/note-mutation-pending";
import type { QueryClient } from "@tanstack/react-query";

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note/model/types";

export type RealtimeNoteChangeEvent = "INSERT" | "UPDATE" | "DELETE";

export interface ApplyRealtimeNoteChangeResult {
  applied: boolean;
  note: Note | null;
  event: RealtimeNoteChangeEvent;
}

/**
 * @returns whether the remote row is strictly newer than the cached copy.
 */
export function isRemoteNoteNewer(
  remote: Note,
  cached: Note | null | undefined,
): boolean {
  if (!cached) {
    return true;
  }

  return remote.lastEditedAt.localeCompare(cached.lastEditedAt) > 0;
}

function mapRealtimeRow(row: Record<string, unknown>): Note {
  return mapNoteRow(row as unknown as NoteRow);
}

function removeNoteFromAllCaches(queryClient: QueryClient, noteId: string): void {
  const calendarQueries = queryClient.getQueriesData<CalendarNotesResponse>({
    queryKey: ["calendarNotes"],
  });

  for (const [queryKey] of calendarQueries) {
    queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
      current ? removeCalendarNoteFromCache(current, noteId) : current,
    );
  }

  queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) =>
    current ? removeGeneralNoteFromCache(current, noteId) : current,
  );
}

/**
 * Patches TanStack caches from one realtime postgres_changes payload.
 */
export function applyRealtimeNoteChange(
  queryClient: QueryClient,
  event: RealtimeNoteChangeEvent,
  newRecord: Record<string, unknown> | null,
  oldRecord: Record<string, unknown> | null,
): ApplyRealtimeNoteChangeResult {
  if (event === "DELETE") {
    const oldNote = oldRecord ? mapRealtimeRow(oldRecord) : null;
    const noteId = oldNote?.id ?? (newRecord?.id as string | undefined);

    if (!noteId) {
      return { applied: false, note: null, event };
    }

    if (isNoteMutationPending(noteId)) {
      return { applied: false, note: oldNote, event };
    }

    removeNoteFromAllCaches(queryClient, noteId);

    return { applied: true, note: oldNote, event };
  }

  if (!newRecord) {
    return { applied: false, note: null, event };
  }

  const note = mapRealtimeRow(newRecord);

  if (note.isQuick) {
    return { applied: false, note, event };
  }

  if (isNoteMutationPending(note.id)) {
    return { applied: false, note, event };
  }

  const cached = findNoteByIdInCache(queryClient, note.id);

  if (event === "UPDATE" && !isRemoteNoteNewer(note, cached)) {
    return { applied: false, note, event };
  }

  const previous =
    cached ??
    (oldRecord && event === "UPDATE" ? mapRealtimeRow(oldRecord) : null);

  const previousDate = previous?.date ?? null;
  const dateChanged =
    event === "UPDATE" &&
    previous !== null &&
    previousDate !== note.date;

  if (dateChanged && previous) {
    relocateNoteInCache(queryClient, previous, note);

    return { applied: true, note, event };
  }

  if (note.date) {
    const month = note.date.slice(0, 7);
    const queryKey = calendarNotesQueryKey(month);

    queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) => {
      if (!current) {
        return current;
      }

      return upsertCalendarNoteInCache(current, note, {
        replaceSameDate: true,
      });
    });

    if (previous?.date && previous.date !== note.date) {
      const oldMonth = previous.date.slice(0, 7);
      const oldKey = calendarNotesQueryKey(oldMonth);

      queryClient.setQueryData<CalendarNotesResponse>(oldKey, (current) =>
        current ? removeCalendarNoteFromCache(current, note.id) : current,
      );
    }

    return { applied: true, note, event };
  }

  removeNoteFromAllCaches(queryClient, note.id);

  queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) =>
    current ? upsertGeneralNoteInCache(current, note) : current,
  );

  return { applied: true, note, event };
}
