/**
 * @file features/notes/note-drawer/model/use-resolved-drawer-note.ts
 * Resolves the note shown in the drawer editor from TanStack cache only.
 */

"use client";

import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Note } from "@/entities/note";
import {
  calendarNotesQueryOptions,
  generalNotesQueryOptions,
  useNoteCategoriesQuery,
} from "@/entities/note/client";
import { findNoteByIdInCache } from "@/features/notes/note-drawer/lib/find-note-in-cache";
import { monthOfIsoDate } from "@/features/notes/note-drawer/lib/month-of-iso-date";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

/**
 * Looks up the editor note for the current drawer context.
 */
export function useResolvedDrawerNote(
  request: NoteEditorRequest | null,
  activeDate: string | null,
  isDateNavEnabled: boolean,
): Note | null {
  const queryClient = useQueryClient();
  const activeMonth =
    isDateNavEnabled && activeDate ? monthOfIsoDate(activeDate) : null;
  const { data: categoriesData } = useNoteCategoriesQuery();

  useQuery({
    ...calendarNotesQueryOptions(activeMonth ?? ""),
    enabled: Boolean(activeMonth),
  });

  useQueries({
    queries:
      categoriesData?.categories.map((category) =>
        generalNotesQueryOptions(category.id),
      ) ?? [],
  });

  if (!request) {
    return null;
  }

  if (request.mode === "edit") {
    return findNoteByIdInCache(queryClient, request.noteId);
  }

  return null;
}
