/**
 * @file features/notes/note-drawer/model/use-resolved-drawer-note.ts
 * Resolves the note shown in the drawer editor from TanStack cache only.
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Note } from "@/entities/note";
import {
  calendarNotesQueryOptions,
  useGeneralNotesQuery,
} from "@/entities/note/client";
import { findNoteByIdInCache } from "@/features/notes/note-drawer/lib/find-note-in-cache";
import { monthOfIsoDate } from "@/features/notes/note-drawer/lib/month-of-iso-date";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

/**
 * Looks up the editor note for the current drawer context.
 *
 * - Edit mode: note by id across calendar and general caches
 * - Create mode: always `null` (draft). Occupants on the active day are
 *   discovered via the conflict gate / `openEdit`, not by binding into the form —
 *   otherwise a 409 cache seed would wipe in-progress create drafts.
 *
 * Re-resolves on every render (cheap `getQueryData` walk). Do not memoize on
 * `[queryClient, request]` only — that kept a stale `Note` after realtime /
 * `setQueryData` while list cards (direct `useQuery` data) updated, so open
 * drawers on other devices stopped collaborating.
 */
export function useResolvedDrawerNote(
  request: NoteEditorRequest | null,
  activeDate: string | null,
  isDateNavEnabled: boolean,
): Note | null {
  const queryClient = useQueryClient();
  const activeMonth =
    isDateNavEnabled && activeDate ? monthOfIsoDate(activeDate) : null;

  // Subscribe so cache patches (realtime / mutations) re-render this hook.
  // `formReloadKey` bumps also re-render the drawer; both paths must see a
  // fresh `findNoteByIdInCache` result, not a memoized snapshot.
  useQuery({
    ...calendarNotesQueryOptions(activeMonth ?? ""),
    enabled: Boolean(activeMonth),
  });
  useGeneralNotesQuery();

  if (!request) {
    return null;
  }

  if (request.mode === "edit") {
    return findNoteByIdInCache(queryClient, request.noteId);
  }

  return null;
}
