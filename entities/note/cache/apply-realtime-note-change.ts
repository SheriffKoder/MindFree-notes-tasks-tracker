/**
 * @file entities/note/cache/apply-realtime-note-change.ts
 * Applies Supabase realtime row events to TanStack note read caches.
 *
 * Purpose: Keep calendar/general caches in sync with remote writes.
 * Used in: entities/note/hooks/use-notes-realtime-sync.ts
 * Used for: INSERT/UPDATE/DELETE on mf_notes with last_edited_at gating.
 */

import { findNoteByIdInCache } from "@/entities/note/cache/find-note-in-cache";
import {
  synchronizeNoteCaches,
  upsertNoteInOwnerCaches,
} from "@/entities/note/cache/synchronize-note-caches";
import { isNoteMutationPending } from "@/entities/note/hooks/note-mutation-pending";
import type { Note, NoteRow } from "@/entities/note/model/types";
import { mapNoteRow } from "@/entities/note/transform";
import type { QueryClient } from "@tanstack/react-query";

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

    synchronizeNoteCaches(queryClient, {
      type: "delete",
      note: oldNote ?? {
        id: noteId,
        date: null,
        title: "",
        content: "",
        starred: false,
        isImportant: false,
        isQuick: false,
        lastEditedAt: "",
      },
    });

    return { applied: true, note: oldNote, event };
  }

  if (!newRecord) {
    return { applied: false, note: null, event };
  }

  const note = mapRealtimeRow(newRecord);

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

  if (event === "INSERT") {
    synchronizeNoteCaches(queryClient, { type: "create", note });
    return { applied: true, note, event };
  }

  if (previous) {
    synchronizeNoteCaches(queryClient, { type: "update", previous, next: note });
    return { applied: true, note, event };
  }

  upsertNoteInOwnerCaches(queryClient, note);

  return { applied: true, note, event };
}
