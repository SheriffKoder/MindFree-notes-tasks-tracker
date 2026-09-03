/**
 * @file entities/note/category/hooks/use-soft-delete-note-category-mutation.ts
 * TanStack mutation for soft-deleting (archiving) a note category.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyCategorySoftDeleteToCaches } from "@/entities/note/category/cache";
import { fetchSoftDeleteNoteCategory } from "@/entities/note/category/client/delete-category";
import type { NoteCategory } from "@/entities/note/category/model/types";

export interface SoftDeleteNoteCategoryMutationInput {
  /** Category being archived — used to patch caches after 204. */
  category: NoteCategory;
}

/**
 * Soft-delete category — removes from active list; keeps generalNotes cache.
 */
export function useSoftDeleteNoteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category }: SoftDeleteNoteCategoryMutationInput) => {
      await fetchSoftDeleteNoteCategory(category.id);
      // Server returns 204 — synthesize archived snapshot for cache patch
      return {
        ...category,
        deletedAt: new Date().toISOString(),
      } satisfies NoteCategory;
    },
    onSuccess: (category) => {
      applyCategorySoftDeleteToCaches(queryClient, category);
    },
  });
}
