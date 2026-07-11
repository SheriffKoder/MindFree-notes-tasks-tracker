/**
 * @file entities/note/tanstack/use-update-note-mutation.ts
 * TanStack mutation for drawer PATCH autosave with optimistic cache updates.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import { fetchPatchNote } from "@/entities/note/mutations/patch-note";
import {
  mergeFormValuesIntoNote,
  patchCalendarNotesCache,
  patchGeneralNotesCache,
  resolveOwningQueryKey,
} from "@/entities/note/mutations/patch-note-in-cache";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  Note,
} from "@/entities/note/model/types";

export interface UpdateNoteMutationInput {
  /** Existing note row being edited. */
  note: Note;
  /** Full editable form snapshot sent to the API. */
  values: NoteFormValues;
}

interface UpdateNoteMutationContext {
  previousData: CalendarNotesResponse | GeneralNotesResponse | undefined;
  queryKey: ReturnType<typeof resolveOwningQueryKey>;
}

/**
 * PATCH autosave mutation — optimistically updates the owning read cache only.
 */
export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ note, values }: UpdateNoteMutationInput) => {
      const response = await fetchPatchNote(note.id, values);
      return response.note;
    },
    onMutate: async ({ note, values }) => {
      const queryKey = resolveOwningQueryKey(note);

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<
        CalendarNotesResponse | GeneralNotesResponse
      >(queryKey);
      const optimisticNote = mergeFormValuesIntoNote(note, values);

      if (note.date) {
        queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
          current
            ? patchCalendarNotesCache(current, optimisticNote)
            : current,
        );
      } else {
        queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
          current
            ? patchGeneralNotesCache(current, optimisticNote)
            : current,
        );
      }

      return { previousData, queryKey } satisfies UpdateNoteMutationContext;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousData);
    },
    onSuccess: (serverNote, { note }) => {
      const queryKey = resolveOwningQueryKey(note);

      if (note.date) {
        queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
          current ? patchCalendarNotesCache(current, serverNote) : current,
        );
      } else {
        queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
          current ? patchGeneralNotesCache(current, serverNote) : current,
        );
      }
    },
  });
}
