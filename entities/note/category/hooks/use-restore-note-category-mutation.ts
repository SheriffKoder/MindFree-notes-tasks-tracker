/**
 * @file entities/note/category/hooks/use-restore-note-category-mutation.ts
 * TanStack mutation for restoring an archived note category.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyCategoryRestoreToCaches } from "@/entities/note/category/cache";
import { fetchRestoreNoteCategory } from "@/entities/note/category/client/restore-category";

export interface RestoreNoteCategoryMutationInput {
  id: string;
}

/**
 * Restore category — re-adds to active list; invalidates Home when showOnHome.
 */
export function useRestoreNoteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: RestoreNoteCategoryMutationInput) => {
      const response = await fetchRestoreNoteCategory(id);
      return response.category;
    },
    onSuccess: (category) => {
      applyCategoryRestoreToCaches(queryClient, category);
    },
  });
}
