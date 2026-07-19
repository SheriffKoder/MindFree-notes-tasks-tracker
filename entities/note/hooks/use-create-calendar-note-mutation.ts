/**
 * @file entities/note/hooks/use-create-calendar-note-mutation.ts
 * TanStack mutation for lazy calendar note creation.
 *
 * Purpose: Wire fetchPostCalendarNote to TanStack with optimistic month cache insert.
 * Used in: features/notes/note-drawer/pre-save-orchestrator/use-pre-save-orchestrator.ts
 * Used for: First meaningful content on a calendar day, including replace-on-date.
 *
 * Steps:
 * 1. Cancel in-flight reads for the target month query key.
 * 2. Upsert optimistic note with replaceSameDate (one note per day in cache).
 * 3. On success, replace optimistic row with the server-confirmed note.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import {
  buildOptimisticCalendarNote,
  synchronizeNoteCaches,
  upsertCalendarNoteInCache,
} from "@/entities/note/cache";
import { fetchPostCalendarNote } from "@/entities/note/client/post-note";
import type { CalendarNotesResponse } from "@/entities/note/model/read-models";
import { calendarNotesQueryKey } from "@/entities/note/client/query-keys";

export interface CreateCalendarNoteMutationInput {
  /** Target ISO date (`YYYY-MM-DD`). */
  date: string;
  /** Editable form snapshot sent to the API. */
  values: NoteFormValues;
  /** When true, server deletes the other note on the target day first. */
  replaceExistingOnDate?: boolean;
}

interface CreateCalendarNoteMutationContext {
  previousData: CalendarNotesResponse | undefined;
  queryKey: ReturnType<typeof calendarNotesQueryKey>;
}

/**
 * POST calendar note — optimistically inserts into `["calendarNotes", month]`.
 */
export function useCreateCalendarNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      values,
      replaceExistingOnDate,
    }: CreateCalendarNoteMutationInput) => {
      const response = await fetchPostCalendarNote(
        date,
        values,
        replaceExistingOnDate,
      );
      return response.note;
    },
    onMutate: async ({ date, values }) => {
      const month = date.slice(0, 7);
      const queryKey = calendarNotesQueryKey(month);

      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<CalendarNotesResponse>(queryKey);
      const optimisticNote = buildOptimisticCalendarNote(date, values);

      queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
        current
          ? upsertCalendarNoteInCache(current, optimisticNote, {
              replaceSameDate: true,
            })
          : current,
      );

      return { previousData, queryKey } satisfies CreateCalendarNoteMutationContext;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousData);
    },
    onSuccess: (serverNote, { date }) => {
      const month = date.slice(0, 7);
      const queryKey = calendarNotesQueryKey(month);

      queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
        current
          ? upsertCalendarNoteInCache(current, serverNote, {
              replaceSameDate: true,
            })
          : current,
      );

      if (serverNote.starred) {
        synchronizeNoteCaches(queryClient, { type: "create", note: serverNote });
      }
    },
  });
}
