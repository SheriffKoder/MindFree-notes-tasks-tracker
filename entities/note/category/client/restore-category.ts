/**
 * @file entities/note/category/client/restore-category.ts
 * Client POST fetcher for restoring an archived note category.
 *
 * Purpose: HTTP write used by useRestoreNoteCategoryMutation.
 * Used in: entities/note/category/hooks/use-restore-note-category-mutation.ts
 * Used for: Reactivate soft-deleted categories from the manage drawer.
 */

import type { NoteCategory } from "@/entities/note/category/model/types";

export interface RestoreCategoryResponse {
  category: NoteCategory;
}

/**
 * Restores a soft-deleted category via POST `/api/notes/categories/:id/restore`.
 */
export async function fetchRestoreNoteCategory(
  id: string,
): Promise<RestoreCategoryResponse> {
  const response = await fetch(
    `/api/notes/categories/${encodeURIComponent(id)}/restore`,
    {
      method: "POST",
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      code?: string;
    } | null;
    const error = new Error(
      errorBody?.error ?? "Failed to restore note category.",
    ) as Error & { code?: string; status?: number };
    error.status = response.status;
    error.code = errorBody?.code;
    throw error;
  }

  return response.json() as Promise<RestoreCategoryResponse>;
}
