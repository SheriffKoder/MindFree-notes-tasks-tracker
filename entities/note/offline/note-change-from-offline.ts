/**
 * @file entities/note/offline/note-change-from-offline.ts
 * Maps flushed offline note payloads to normalized {@link NoteChange} values.
 */

import type { QueryClient } from "@tanstack/react-query";

import { findNoteByIdInCache } from "@/entities/note/lib/find-note-in-cache";
import type { NoteChange } from "@/entities/note/mutations/synchronize-note-caches";
import type { Note } from "@/entities/note/model/types";

import type { NoteOfflinePayload } from "./notes-offline-storage";

function buildDeleteNoteFromPayload(payload: NoteOfflinePayload): Note {
  return {
    id: payload.noteId!,
    date: payload.date,
    title: payload.values.title,
    content: payload.values.content,
    starred: payload.values.starred,
    isImportant: payload.values.isImportant,
    isQuick: payload.isQuick ?? false,
    lastEditedAt: payload.savedAt,
  };
}

/**
 * Converts one successful offline flush into a hub-ready note change.
 */
export function noteChangeFromOfflineFlush(
  queryClient: QueryClient,
  payload: NoteOfflinePayload,
  options: {
    previous: Note | null;
    serverNote: Note | null;
  },
): NoteChange | null {
  if (payload.operation === "delete") {
    if (!payload.noteId) {
      return null;
    }

    const note =
      options.previous ?? findNoteByIdInCache(queryClient, payload.noteId);

    return {
      type: "delete",
      note: note ?? buildDeleteNoteFromPayload(payload),
    };
  }

  if (!options.serverNote) {
    return null;
  }

  if (options.previous) {
    return {
      type: "update",
      previous: options.previous,
      next: options.serverNote,
    };
  }

  return { type: "create", note: options.serverNote };
}
