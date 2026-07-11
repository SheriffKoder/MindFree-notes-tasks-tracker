/**
 * @file features/notes/note-drawer/model/use-resolved-drawer-note.ts
 * Resolves the note shown in the drawer editor from TanStack cache only.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Note } from "@/entities/note";
import {
  calendarNotesQueryOptions,
  useGeneralNotesQuery,
} from "@/entities/note/client";
import { monthOfIsoDate } from "@/features/notes/note-drawer/lib/month-of-iso-date";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

/**
 * Looks up the editor note for the current drawer context.
 *
 * - Date mode: note for `activeDate` in `["calendarNotes", monthOf(activeDate)]`
 * - General edit: note by id in `["generalNotes"]`
 * - Create requests without a matching row return `null` (empty draft)
 */
export function useResolvedDrawerNote(
  request: NoteEditorRequest | null,
  activeDate: string | null,
  isDateNavEnabled: boolean,
): Note | null {
  const activeMonth =
    isDateNavEnabled && activeDate ? monthOfIsoDate(activeDate) : null;

  const { data: calendarData } = useQuery({
    ...calendarNotesQueryOptions(activeMonth ?? ""),
    enabled: Boolean(activeMonth),
  });
  const { data: generalData } = useGeneralNotesQuery();

  return useMemo(() => {
    if (!request) {
      return null;
    }

    if (isDateNavEnabled && activeDate) {
      return (
        calendarData?.monthNotes.find((note) => note.date === activeDate) ??
        null
      );
    }

    if (request.mode === "edit") {
      return (
        generalData?.generalNotes.find((note) => note.id === request.noteId) ??
        null
      );
    }

    return null;
  }, [
    activeDate,
    calendarData?.monthNotes,
    generalData?.generalNotes,
    isDateNavEnabled,
    request,
  ]);
}
