/**
 * @file entities/note/category/hooks/use-update-note-category-mutation.ts
 * TanStack mutation for updating a note category.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyCategoryUpdateToCaches } from "@/entities/note/category/cache";
import { fetchPatchNoteCategory } from "@/entities/note/category/client/patch-category";
import type { UpdateNoteCategoryBody } from "@/entities/note/category/schema";

export interface UpdateNoteCategoryMutationInput {
  id: string;
  body: UpdateNoteCategoryBody;
}

/**
 * PATCH category — patches category lists and invalidates Home strips.
 */
export function useUpdateNoteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: UpdateNoteCategoryMutationInput) => {
      const response = await fetchPatchNoteCategory(id, body);
      return response.category;
    },
    onSuccess: (category) => {
      applyCategoryUpdateToCaches(queryClient, category);
    },
  });
}
