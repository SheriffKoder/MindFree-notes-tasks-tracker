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
  buildOptimisticQuickNote,
} from "@/entities/note/mutations/note-cache-mutations";
import { mergeFormValuesIntoNote } from "@/entities/note/mutations/patch-note-in-cache";
import { fetchPatchNote } from "@/entities/note/mutations/patch-note";
import {
  fetchPostCalendarNote,
  fetchPostGeneralNote,
  fetchPostQuickNote,
} from "@/entities/note/mutations/post-note";
import { synchronizeNoteCaches } from "@/entities/note/mutations/synchronize-note-caches";
import type { HomeNotesResponse, Note } from "@/entities/note/model/types";
import { homeNotesQueryKey } from "@/entities/note/tanstack/query-keys";
import type { OfflineEntityAdapter } from "@/shared/offline-queue";
import {
  removeOfflineWrite,
  saveOfflineWrite,
} from "@/shared/offline-queue";
import type { OfflineWrite } from "@/shared/offline-queue";

import { noteChangeFromOfflineFlush } from "./note-change-from-offline";

export const NOTE_OFFLINE_ENTITY = "note";

export const NOTE_OFFLINE_QUICK_KEY = "note:quick";

export type NoteOfflineOperation =
  | "patch"
  | "create-calendar"
  | "create-general"
  | "create-quick"
  | "delete";

export interface NoteOfflinePayload {
  operation: NoteOfflineOperation;
  noteId: string | null;
  date: string | null;
  values: NoteFormValues;
  isQuick?: boolean;
  replaceExistingOnDate: boolean;
  savedAt: string;
}

export interface NoteOfflinePendingInput {
  kind: NoteOfflineOperation;
  note?: Note;
  values: NoteFormValues;
  date?: string | null;
  isQuick?: boolean;
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
    case "create-quick":
      return NOTE_OFFLINE_QUICK_KEY;
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
      isQuick: payload.isQuick,
      replaceExistingOnDate: payload.replaceExistingOnDate,
    };
  }

  return {
    kind: payload.operation,
    values: payload.values,
    date: payload.date,
    isQuick: payload.isQuick,
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
      isQuick: input.isQuick,
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
        {
          date: datePatch ?? input.date ?? input.note.date,
          isQuick: input.isQuick,
        },
      );

      synchronizeNoteCaches(queryClient, {
        type: "update",
        previous: input.note,
        next: optimisticNote,
      });

      return;
    }
    case "create-calendar": {
      const date = input.date;

      if (!date) {
        return;
      }

      const optimisticNote = buildOptimisticCalendarNote(date, input.values);

      synchronizeNoteCaches(queryClient, {
        type: "create",
        note: optimisticNote,
      });

      return;
    }
    case "create-general": {
      const optimisticNote = buildOptimisticGeneralNote(input.values);

      synchronizeNoteCaches(queryClient, {
        type: "create",
        note: optimisticNote,
      });

      return;
    }
    case "create-quick": {
      const optimisticNote = buildOptimisticQuickNote(input.values);

      synchronizeNoteCaches(queryClient, {
        type: "create",
        note: optimisticNote,
      });

      return;
    }
    case "delete": {
      if (!input.note) {
        return;
      }

      synchronizeNoteCaches(queryClient, { type: "delete", note: input.note });
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

  if (payload.operation === "create-quick") {
    return (
      findNoteByIdInCache(queryClient, "optimistic-quick") ??
      queryClient.getQueryData<HomeNotesResponse>(homeNotesQueryKey)?.quickNote ??
      null
    );
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

  if (payload.operation === "create-quick") {
    const cached = resolveCachedNoteForPayload(queryClient, payload);

    if (!cached) {
      return true;
    }

    return payload.savedAt > cached.lastEditedAt;
  }

  const cached = resolveCachedNoteForPayload(queryClient, payload);

  if (!cached) {
    return true;
  }

  return payload.savedAt > cached.lastEditedAt;
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
        payload.isQuick,
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
    case "create-quick": {
      const response = await fetchPostQuickNote(payload.values);
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
          const change = noteChangeFromOfflineFlush(queryClient, payload, {
            previous,
            serverNote,
          });

          if (change) {
            synchronizeNoteCaches(queryClient, change);
          }

          removeOfflineWrite(write.userId, write.key);
        } catch {
          // Keep in storage until the next reconnect or focus flush.
        }
      }
    },
  };
}
