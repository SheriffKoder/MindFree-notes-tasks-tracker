/**
 * @file entities/note/mutations/synchronize-note-caches.ts
 * Source-agnostic TanStack cache synchronization hub for note read models.
 *
 * Purpose: Apply one normalized note change to owner + home caches.
 * Used in: mutations, realtime adapter, offline replay reconciliation.
 * Used for: create / update / delete writes from any source adapter.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  applyHomeNoteCreate,
  applyHomeNoteDelete,
  applyHomeNoteUpdate,
  relocateNoteInCache,
  removeCalendarNoteFromCache,
  removeGeneralNoteFromCache,
  upsertCalendarNoteInCache,
  upsertGeneralNoteInCache,
} from "@/entities/note/mutations/note-cache-mutations";
import {
  patchCalendarNotesCache,
  patchGeneralNotesCache,
  resolveOwningQueryKey,
} from "@/entities/note/mutations/patch-note-in-cache";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  HomeNotesResponse,
  Note,
} from "@/entities/note/model/types";
import {
  calendarNotesQueryKey,
  generalNotesQueryKey,
  homeNotesQueryKey,
} from "@/entities/note/tanstack/query-keys";

/** Normalized note write — sources map HTTP/realtime/offline payloads to this union. */
export type NoteChange =
  | { type: "create"; note: Note }
  | { type: "update"; previous: Note; next: Note }
  | { type: "delete"; note: Note };

function removeNoteFromOwnerCachesById(
  queryClient: QueryClient,
  noteId: string,
): void {
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

function removeNoteFromOwnerCaches(queryClient: QueryClient, note: Note): void {
  if (note.date) {
    const queryKey = resolveOwningQueryKey(note);

    queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
      current ? removeCalendarNoteFromCache(current, note.id) : current,
    );
    return;
  }

  if (!note.isQuick) {
    queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) =>
      current ? removeGeneralNoteFromCache(current, note.id) : current,
    );
  }
}

function syncHomeOnCreate(queryClient: QueryClient, note: Note): void {
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) => {
    const base = current ?? { quickNote: null, starredNotes: [] };
    return applyHomeNoteCreate(base, note);
  });
}

function syncHomeOnUpdate(
  queryClient: QueryClient,
  previous: Note,
  next: Note,
): void {
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) => {
    const base = current ?? { quickNote: null, starredNotes: [] };
    return applyHomeNoteUpdate(base, previous, next);
  });
}

function syncHomeOnDelete(queryClient: QueryClient, noteId: string): void {
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) => {
    if (!current) {
      return current;
    }

    return applyHomeNoteDelete(current, noteId);
  });
}

function syncOwnerOnCreate(queryClient: QueryClient, note: Note): void {
  if (note.isQuick) {
    return;
  }

  if (note.date) {
    const queryKey = calendarNotesQueryKey(note.date.slice(0, 7));

    queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
      current
        ? upsertCalendarNoteInCache(current, note, { replaceSameDate: true })
        : current,
    );
    return;
  }

  queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) =>
    current ? upsertGeneralNoteInCache(current, note) : current,
  );
}

function syncOwnerOnUpdate(
  queryClient: QueryClient,
  previous: Note,
  next: Note,
): void {
  if (next.isQuick) {
    removeNoteFromOwnerCaches(queryClient, previous);
    return;
  }

  if (previous.date !== next.date) {
    relocateNoteInCache(queryClient, previous, next);
    return;
  }

  if (next.date) {
    const queryKey = calendarNotesQueryKey(next.date.slice(0, 7));

    queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
      current ? patchCalendarNotesCache(current, next) : current,
    );
    return;
  }

  queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) => {
    if (!current) {
      return current;
    }

    return previous.isQuick
      ? upsertGeneralNoteInCache(current, next)
      : patchGeneralNotesCache(current, next);
  });
}

function syncOwnerOnDelete(queryClient: QueryClient, note: Note): void {
  if (note.isQuick) {
    return;
  }

  removeNoteFromOwnerCachesById(queryClient, note.id);
}

/**
 * Upserts one note into owner caches only — used for orphan realtime UPDATE rows.
 */
export function upsertNoteInOwnerCaches(
  queryClient: QueryClient,
  note: Note,
): void {
  syncOwnerOnCreate(queryClient, note);
}

/**
 * Applies one normalized note change to every TanStack read model that cares.
 */
export function synchronizeNoteCaches(
  queryClient: QueryClient,
  change: NoteChange,
): void {
  switch (change.type) {
    case "create":
      syncOwnerOnCreate(queryClient, change.note);
      syncHomeOnCreate(queryClient, change.note);
      break;
    case "update":
      syncHomeOnUpdate(queryClient, change.previous, change.next);
      syncOwnerOnUpdate(queryClient, change.previous, change.next);
      break;
    case "delete":
      syncOwnerOnDelete(queryClient, change.note);
      syncHomeOnDelete(queryClient, change.note.id);
      break;
  }
}
