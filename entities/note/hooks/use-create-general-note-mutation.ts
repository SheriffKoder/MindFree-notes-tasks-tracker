/**
 * @file entities/note/hooks/use-create-general-note-mutation.ts
 * TanStack mutation for lazy general note creation.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import {
  buildOptimisticGeneralNote,
  synchronizeNoteCaches,
  upsertGeneralNoteInCache,
} from "@/entities/note/cache";
import { fetchPostGeneralNote } from "@/entities/note/client/post-note";
import type { GeneralNotesResponse } from "@/entities/note/model/read-models";
import { generalNotesQueryKey } from "@/entities/note/client/query-keys";

export interface CreateGeneralNoteMutationInput {
  /** Target category for the undated note. */
  categoryId: string;
  /** Editable form snapshot sent to the API. */
  values: NoteFormValues;
}

interface CreateGeneralNoteMutationContext {
  previousData: GeneralNotesResponse | undefined;
  queryKey: ReturnType<typeof generalNotesQueryKey>;
}

/**
 * POST general note — optimistically inserts into the category general cache.
 */
export function useCreateGeneralNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, values }: CreateGeneralNoteMutationInput) => {
      const response = await fetchPostGeneralNote(categoryId, values);
      return response.note;
    },
    onMutate: async ({ categoryId, values }) => {
      const queryKey = generalNotesQueryKey(categoryId);

      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<GeneralNotesResponse>(queryKey);
      const optimisticNote = buildOptimisticGeneralNote(values, categoryId);

      queryClient.setQueryData<GeneralNotesResponse>(queryKey, (current) =>
        current
          ? upsertGeneralNoteInCache(current, optimisticNote)
          : current,
      );

      return { previousData, queryKey } satisfies CreateGeneralNoteMutationContext;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousData);
    },
    onSuccess: (serverNote) => {
      if (!serverNote.categoryId) {
        return;
      }

      queryClient.setQueryData<GeneralNotesResponse>(
        generalNotesQueryKey(serverNote.categoryId),
        (current) =>
          current ? upsertGeneralNoteInCache(current, serverNote) : current,
      );

      if (serverNote.starred) {
        synchronizeNoteCaches(queryClient, { type: "create", note: serverNote });
      }
    },
  });
}
