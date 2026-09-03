/**
 * @file entities/note/category/hooks/use-hard-delete-note-category-mutation.ts
 * TanStack mutation for permanently deleting a note category.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyCategoryHardDeleteToCaches } from "@/entities/note/category/cache";
import { fetchHardDeleteNoteCategory } from "@/entities/note/category/client/delete-category";

export interface HardDeleteNoteCategoryMutationInput {
  id: string;
}

/**
 * Hard-delete category — purges category lists, generalNotes, and Home strip.
 */
export function useHardDeleteNoteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: HardDeleteNoteCategoryMutationInput) => {
      await fetchHardDeleteNoteCategory(id);
      return id;
    },
    onSuccess: (categoryId) => {
      applyCategoryHardDeleteToCaches(queryClient, categoryId);
    },
  });
}
