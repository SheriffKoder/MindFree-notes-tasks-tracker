/**
 * @file views/notes/model/editor/use-resolved-drawer-note.ts
 * Resolves the note record for an edit-mode drawer request from TanStack cache.
 */

"use client";

import { useMemo } from "react";

import type { Note } from "@/entities/note";
import {
  useCalendarNotesQuery,
  useGeneralNotesQuery,
} from "@/entities/note/client";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

/**
 * Looks up an existing note for `mode: "edit"` requests.
 * Create requests return `null` — the editor shows an empty draft.
 */
export function useResolvedDrawerNote(
  request: NoteEditorRequest | null,
  month: string,
): Note | null {
  const { data: calendarData } = useCalendarNotesQuery(month);
  const { data: generalData } = useGeneralNotesQuery();

  return useMemo(() => {
    if (!request || request.mode !== "edit") {
      return null;
    }

    const calendarMatch = calendarData?.monthNotes.find(
      (note) => note.id === request.noteId,
    );

    if (calendarMatch) {
      return calendarMatch;
    }

    return (
      generalData?.generalNotes.find((note) => note.id === request.noteId) ??
      null
    );
  }, [calendarData?.monthNotes, generalData?.generalNotes, request]);
}
