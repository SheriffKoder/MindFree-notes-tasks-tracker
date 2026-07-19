/**
 * @file entities/note/hooks/use-create-quick-note-mutation.ts
 * TanStack mutation for lazy quick note creation.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import {
  buildOptimisticQuickNote,
  synchronizeNoteCaches,
} from "@/entities/note/cache";
import { fetchPostQuickNote } from "@/entities/note/client/post-note";
import type { HomeNotesResponse } from "@/entities/note/model/read-models";
import { homeNotesQueryKey } from "@/entities/note/client/query-keys";

export interface CreateQuickNoteMutationInput {
  /** Editable form snapshot sent to the API. */
  values: NoteFormValues;
}

interface CreateQuickNoteMutationContext {
  previousData: HomeNotesResponse | undefined;
  queryKey: typeof homeNotesQueryKey;
}

/**
 * POST quick note — optimistically sets `["homeNotes"].quickNote`.
 */
export function useCreateQuickNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ values }: CreateQuickNoteMutationInput) => {
      const response = await fetchPostQuickNote(values);
      return response.note;
    },
    onMutate: async ({ values }) => {
      const queryKey = homeNotesQueryKey;

      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<HomeNotesResponse>(queryKey);
      const optimisticNote = buildOptimisticQuickNote(values);

      synchronizeNoteCaches(queryClient, {
        type: "create",
        note: optimisticNote,
      });

      return { previousData, queryKey } satisfies CreateQuickNoteMutationContext;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousData);
    },
    onSuccess: (serverNote) => {
      synchronizeNoteCaches(queryClient, { type: "create", note: serverNote });
    },
  });
}
