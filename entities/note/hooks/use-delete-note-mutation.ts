/**
 * @file entities/note/hooks/use-delete-note-mutation.ts
 * TanStack mutation for deleting calendar notes when content is cleared.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  resolveOwningQueryKey,
  synchronizeNoteCaches,
} from "@/entities/note/cache";
import { fetchDeleteNote } from "@/entities/note/client/delete-note";
import {
  clearNoteMutationPending,
  markNoteMutationPending,
} from "@/entities/note/hooks/note-mutation-pending";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  HomeNotesResponse,
} from "@/entities/note/model/read-models";
import type { Note } from "@/entities/note/model/types";
import { generalNotesQueryKey, homeNotesQueryKey } from "@/entities/note/client/query-keys";

export interface DeleteNoteMutationInput {
  /** Existing note row to delete. */
  note: Note;
}

interface DeleteNoteMutationContext {
  previousCalendarData: CalendarNotesResponse | undefined;
  previousGeneralData: GeneralNotesResponse | undefined;
  previousHomeData: HomeNotesResponse | undefined;
  queryKey: ReturnType<typeof resolveOwningQueryKey>;
}

/**
 * DELETE note — optimistically removes from the owning read cache only.
 */
export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ note }: DeleteNoteMutationInput) => {
      await fetchDeleteNote(note.id);
      return note;
    },
    onMutate: async ({ note }) => {
      markNoteMutationPending(note.id);

      const queryKey = resolveOwningQueryKey(note);

      await queryClient.cancelQueries({ queryKey });

      const previousCalendarData =
        queryClient.getQueryData<CalendarNotesResponse>(queryKey);
      const previousGeneralData =
        queryClient.getQueryData<GeneralNotesResponse>(generalNotesQueryKey);
      const previousHomeData =
        queryClient.getQueryData<HomeNotesResponse>(homeNotesQueryKey);

      synchronizeNoteCaches(queryClient, { type: "delete", note });

      return {
        previousCalendarData,
        previousGeneralData,
        previousHomeData,
        queryKey,
      } satisfies DeleteNoteMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      clearNoteMutationPending(variables.note.id);
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      if (context.previousCalendarData !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousCalendarData);
      }

      if (context.previousGeneralData !== undefined) {
        queryClient.setQueryData(
          generalNotesQueryKey,
          context.previousGeneralData,
        );
      }

      if (context.previousHomeData !== undefined) {
        queryClient.setQueryData(homeNotesQueryKey, context.previousHomeData);
      }
    },
  });
}
