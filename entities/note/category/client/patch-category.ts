/**
 * @file entities/note/category/client/patch-category.ts
 * Client PATCH fetcher for updating a note category.
 *
 * Purpose: HTTP write used by useUpdateNoteCategoryMutation.
 * Used in: entities/note/category/hooks/use-update-note-category-mutation.ts
 * Used for: Rename / showOnHome / sortOrder from the manage drawer.
 */

import type { NoteCategory } from "@/entities/note/category/model/types";
import type { UpdateNoteCategoryBody } from "@/entities/note/category/schema";

export interface PatchCategoryResponse {
  category: NoteCategory;
}

/**
 * Updates a note category via PATCH `/api/notes/categories/:id`.
 */
export async function fetchPatchNoteCategory(
  id: string,
  body: UpdateNoteCategoryBody,
): Promise<PatchCategoryResponse> {
  const response = await fetch(`/api/notes/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      code?: string;
    } | null;
    const error = new Error(
      errorBody?.error ?? "Failed to update note category.",
    ) as Error & { code?: string; status?: number };
    error.status = response.status;
    error.code = errorBody?.code;
    throw error;
  }

  return response.json() as Promise<PatchCategoryResponse>;
}
