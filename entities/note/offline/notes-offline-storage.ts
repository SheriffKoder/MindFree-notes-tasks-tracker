/**
 * @file entities/note/offline/notes-offline-storage.ts
 * Note form ↔ localStorage ↔ TanStack cache ↔ API.
 */

import type { QueryClient } from "@tanstack/react-query";

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import { findNoteByIdInCache } from "@/entities/note/lib/find-note-in-cache";
import { fetchDeleteNote } from "@/entities/note/mutations/delete-note-client";
import {
  buildOptimisticCalendarNote,
  buildOptimisticGeneralNote,
  patchHomeNotesCache,
  relocateNoteInCache,
  removeCalendarNoteFromCache,
  removeGeneralNoteFromCache,
  removeHomeNoteFromCacheQuery,
  upsertCalendarNoteInCache,
  upsertGeneralNoteInCache,
  upsertHomeNoteInCache,
} from "@/entities/note/mutations/note-cache-mutations";
import {
  mergeFormValuesIntoNote,
  patchCalendarNotesCache,
  patchGeneralNotesCache,
  resolveOwningQueryKey,
} from "@/entities/note/mutations/patch-note-in-cache";
import { fetchPatchNote } from "@/entities/note/mutations/patch-note";
import {
  fetchPostCalendarNote,
  fetchPostGeneralNote,
} from "@/entities/note/mutations/post-note";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";
import { calendarNotesQueryKey, generalNotesQueryKey } from "@/entities/note/tanstack/query-keys";
import type { OfflineEntityAdapter } from "@/shared/offline-queue";
import {
  removeOfflineWrite,
  saveOfflineWrite,
} from "@/shared/offline-queue";
import type { OfflineWrite } from "@/shared/offline-queue";

export const NOTE_OFFLINE_ENTITY = "note";

export type NoteOfflineOperation =
  | "patch"
  | "create-calendar"
  | "create-general"
  | "delete";

export interface NoteOfflinePayload {
  operation: NoteOfflineOperation;
  noteId: string | null;
  date: string | null;
  values: NoteFormValues;
  replaceExistingOnDate: boolean;
  savedAt: string;
}

export interface NoteOfflinePendingInput {
  kind: NoteOfflineOperation;
  note?: Note;
  values: NoteFormValues;
  date?: string | null;
  replaceExistingOnDate?: boolean;
}

function resolveDatePatch(
  note: Note,
  date: string | null | undefined,
): string | null | undefined {
  if (date === undefined) {
    return undefined;
  }

  if (note.date === date) {
    return undefined;
  }

  return date;
}

/**
 * Builds a stable storage key — one slot per note resource (last-win).
 */
export function buildNoteOfflineKey(input: NoteOfflinePendingInput): string {
  switch (input.kind) {
    case "patch":
    case "delete":
      return `note:${input.note?.id ?? "unknown"}`;
    case "create-calendar":
      return `note:calendar:${input.date ?? "unknown"}`;
    case "create-general":
      return "note:general:draft";
  }
}

function resolvePendingFromPayload(
  queryClient: QueryClient,
  payload: NoteOfflinePayload,
): NoteOfflinePendingInput | null {
  if (payload.operation === "patch" || payload.operation === "delete") {
    const note = payload.noteId
      ? findNoteByIdInCache(queryClient, payload.noteId)
      : null;

    if (!note) {
      return null;
    }

    return {
      kind: payload.operation,
      note,
      values: payload.values,
      date: payload.date,
      replaceExistingOnDate: payload.replaceExistingOnDate,
    };
  }

  return {
    kind: payload.operation,
    values: payload.values,
    date: payload.date,
    replaceExistingOnDate: payload.replaceExistingOnDate,
  };
}

/**
 * Maps a debounced orchestrator payload to a user-scoped offline write.
 */
export function toNoteOfflineWrite(
  userId: string,
  input: NoteOfflinePendingInput,
): OfflineWrite<NoteOfflinePayload> {
  const savedAt = new Date().toISOString();

  return {
    userId,
    entity: NOTE_OFFLINE_ENTITY,
    key: buildNoteOfflineKey(input),
    savedAt,
    payload: {
      operation: input.kind,
      noteId: input.note?.id ?? null,
      date: input.date ?? input.note?.date ?? null,
      values: input.values,
      replaceExistingOnDate: input.replaceExistingOnDate ?? false,
      savedAt,
    },
  };
}

/**
 * Applies optimistic cache updates for one pending note write.
 */
export function applyNoteOfflinePending(
  queryClient: QueryClient,
  input: NoteOfflinePendingInput,
): void {
  switch (input.kind) {
    case "patch": {
      if (!input.note) {
        return;
      }

      const datePatch = resolveDatePatch(input.note, input.date);
      const optimisticNote = mergeFormValuesIntoNote(
        input.note,
        input.values,
        datePatch ?? input.note.date,
      );

      if (datePatch !== undefined) {
        relocateNoteInCache(queryClient, input.note, optimisticNote);
        patchHomeNotesCache(queryClient, input.note, optimisticNote);
        return;
      }

      const queryKey = resolveOwningQueryKey(input.note);

      if (input.note.date) {
        queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
          current
            ? patchCalendarNotesCache(current, optimisticNote)
            : current,
        );
      } else if (!input.note.isQuick) {
        queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
          current
            ? patchGeneralNotesCache(current, optimisticNote)
            : current,
        );
      }

      patchHomeNotesCache(queryClient, input.note, optimisticNote);

      return;
    }
    case "create-calendar": {
      const date = input.date;

      if (!date) {
        return;
      }

      const month = date.slice(0, 7);
      const queryKey = calendarNotesQueryKey(month);
      const optimisticNote = buildOptimisticCalendarNote(date, input.values);

      queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
        current
          ? upsertCalendarNoteInCache(current, optimisticNote, {
              replaceSameDate: true,
            })
          : current,
      );

      return;
    }
    case "create-general": {
      const optimisticNote = buildOptimisticGeneralNote(input.values);

      queryClient.setQueryData<GeneralNotesResponse>(generalNotesQueryKey, (current) =>
        current ? upsertGeneralNoteInCache(current, optimisticNote) : current,
      );

      return;
    }
    case "delete": {
      if (!input.note) {
        return;
      }

      if (input.note.date) {
        const queryKey = resolveOwningQueryKey(input.note);

        queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
          current
            ? removeCalendarNoteFromCache(current, input.note!.id)
            : current,
        );
      } else if (!input.note.isQuick) {
        const queryKey = resolveOwningQueryKey(input.note);

        queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
          current
            ? removeGeneralNoteFromCache(current, input.note!.id)
            : current,
        );
      }

      removeHomeNoteFromCacheQuery(queryClient, input.note.id);
    }
  }
}

function resolveCachedNoteForPayload(
  queryClient: QueryClient,
  payload: NoteOfflinePayload,
): Note | null {
  if (payload.noteId) {
    return findNoteByIdInCache(queryClient, payload.noteId);
  }

  if (payload.operation === "create-calendar" && payload.date) {
    return findNoteByIdInCache(
      queryClient,
      `optimistic-calendar-${payload.date}`,
    );
  }

  if (payload.operation === "create-general") {
    return findNoteByIdInCache(queryClient, "optimistic-general");
  }

  return null;
}

function shouldApplyOfflinePayload(
  queryClient: QueryClient,
  payload: NoteOfflinePayload,
): boolean {
  if (payload.operation === "delete") {
    const cached = payload.noteId
      ? findNoteByIdInCache(queryClient, payload.noteId)
      : null;

    return cached !== null && payload.savedAt > cached.lastEditedAt;
  }

  const cached = resolveCachedNoteForPayload(queryClient, payload);

  if (!cached) {
    return true;
  }

  return payload.savedAt > cached.lastEditedAt;
}

function reconcileServerNote(
  queryClient: QueryClient,
  previousNote: Note | null,
  serverNote: Note,
): void {
  if (previousNote && previousNote.date !== serverNote.date) {
    relocateNoteInCache(queryClient, previousNote, serverNote);
    patchHomeNotesCache(queryClient, previousNote, serverNote);
    return;
  }

  const queryKey = serverNote.date
    ? calendarNotesQueryKey(serverNote.date.slice(0, 7))
    : resolveOwningQueryKey(serverNote);

  if (serverNote.date) {
    queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
      current
        ? upsertCalendarNoteInCache(current, serverNote, {
            replaceSameDate: true,
          })
        : current,
    );
  } else if (!serverNote.isQuick) {
    queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
      current ? upsertGeneralNoteInCache(current, serverNote) : current,
    );
  }

  if (previousNote) {
    patchHomeNotesCache(queryClient, previousNote, serverNote);
    return;
  }

  upsertHomeNoteInCache(queryClient, serverNote);
}

async function executeNoteOfflinePayload(
  payload: NoteOfflinePayload,
): Promise<Note | null> {
  switch (payload.operation) {
    case "patch": {
      if (!payload.noteId) {
        return null;
      }

      const response = await fetchPatchNote(
        payload.noteId,
        payload.values,
        payload.date,
        payload.replaceExistingOnDate,
      );

      return response.note;
    }
    case "create-calendar": {
      if (!payload.date) {
        return null;
      }

      const response = await fetchPostCalendarNote(
        payload.date,
        payload.values,
        payload.replaceExistingOnDate,
      );

      return response.note;
    }
    case "create-general": {
      const response = await fetchPostGeneralNote(payload.values);
      return response.note;
    }
    case "delete": {
      if (!payload.noteId) {
        return null;
      }

      await fetchDeleteNote(payload.noteId);
      return null;
    }
  }
}

/**
 * Persists one pending note write and updates the TanStack cache optimistically.
 */
export function saveNoteOfflinePending(
  userId: string,
  queryClient: QueryClient,
  input: NoteOfflinePendingInput,
): void {
  const write = toNoteOfflineWrite(userId, input);
  saveOfflineWrite(write);
  applyNoteOfflinePending(queryClient, input);
}

/**
 * Registers the note entity adapter for page-level merge + flush.
 */
export function createNotesOfflineSyncAdapter(
  queryClient: QueryClient,
): OfflineEntityAdapter {
  return {
    entity: NOTE_OFFLINE_ENTITY,

    merge(writes) {
      for (const write of writes) {
        const payload = write.payload as NoteOfflinePayload;

        if (!shouldApplyOfflinePayload(queryClient, payload)) {
          continue;
        }

        const pending = resolvePendingFromPayload(queryClient, payload);

        if (pending) {
          applyNoteOfflinePending(queryClient, pending);
        }
      }
    },

    async flush(writes) {
      for (const write of writes) {
        const payload = write.payload as NoteOfflinePayload;

        try {
          const previous = resolveCachedNoteForPayload(queryClient, payload);
          const serverNote = await executeNoteOfflinePayload(payload);

          if (serverNote) {
            reconcileServerNote(queryClient, previous, serverNote);
          }

          removeOfflineWrite(write.userId, write.key);
        } catch {
          // Keep in storage until the next reconnect or focus flush.
        }
      }
    },
  };
}
