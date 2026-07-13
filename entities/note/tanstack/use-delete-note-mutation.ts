/**
 * @file entities/note/tanstack/use-delete-note-mutation.ts
 * TanStack mutation for deleting calendar notes when content is cleared.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchDeleteNote } from "@/entities/note/mutations/delete-note-client";
import { synchronizeNoteCaches } from "@/entities/note/mutations/synchronize-note-caches";
import { resolveOwningQueryKey } from "@/entities/note/mutations/patch-note-in-cache";
import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
  HomeNotesResponse,
  Note,
} from "@/entities/note/model/types";
import { generalNotesQueryKey, homeNotesQueryKey } from "@/entities/note/tanstack/query-keys";
import {
  clearNoteMutationPending,
  markNoteMutationPending,
} from "@/entities/note/tanstack/note-mutation-pending";

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
