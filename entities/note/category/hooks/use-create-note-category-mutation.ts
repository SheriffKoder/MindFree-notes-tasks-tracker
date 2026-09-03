/**
 * @file entities/note/category/hooks/use-create-note-category-mutation.ts
 * TanStack mutation for creating a note category.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyCategoryCreateToCaches } from "@/entities/note/category/cache";
import { fetchPostNoteCategory } from "@/entities/note/category/client/post-category";
import type { CreateNoteCategoryBody } from "@/entities/note/category/schema";

export type CreateNoteCategoryMutationInput = CreateNoteCategoryBody;

/**
 * POST category — patches active (+ withDeleted) caches on success.
 */
export function useCreateNoteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNoteCategoryMutationInput) => {
      const response = await fetchPostNoteCategory(input);
      return response.category;
    },
    onSuccess: (category) => {
      applyCategoryCreateToCaches(queryClient, category);
    },
  });
}
