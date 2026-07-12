/**
 * @file entities/note/tanstack/use-delete-note-mutation.ts
 * TanStack mutation for deleting calendar notes when content is cleared.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchDeleteNote } from "@/entities/note/mutations/delete-note-client";
import { removeCalendarNoteFromCache } from "@/entities/note/mutations/note-cache-mutations";
import { resolveOwningQueryKey } from "@/entities/note/mutations/patch-note-in-cache";
import type { CalendarNotesResponse, Note } from "@/entities/note/model/types";
import {
  clearNoteMutationPending,
  markNoteMutationPending,
} from "@/entities/note/tanstack/note-mutation-pending";

export interface DeleteNoteMutationInput {
  /** Existing note row to delete. */
  note: Note;
}

interface DeleteNoteMutationContext {
  previousData: CalendarNotesResponse | undefined;
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

      const previousData =
        queryClient.getQueryData<CalendarNotesResponse>(queryKey);

      if (note.date) {
        queryClient.setQueryData<CalendarNotesResponse>(queryKey, (current) =>
          current ? removeCalendarNoteFromCache(current, note.id) : current,
        );
      }

      return { previousData, queryKey } satisfies DeleteNoteMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      clearNoteMutationPending(variables.note.id);
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousData);
    },
  });
}
