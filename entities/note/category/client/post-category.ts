/**
 * @file entities/note/category/client/post-category.ts
 * Client POST fetcher for creating a note category.
 *
 * Purpose: HTTP write used by useCreateNoteCategoryMutation.
 * Used in: entities/note/category/hooks/use-create-note-category-mutation.ts
 * Used for: Manage drawer "Add category".
 */

import type { NoteCategory } from "@/entities/note/category/model/types";
import type { CreateNoteCategoryBody } from "@/entities/note/category/schema";

export interface PostCategoryResponse {
  category: NoteCategory;
}

/**
 * Creates a note category via POST `/api/notes/categories`.
 */
export async function fetchPostNoteCategory(
  body: CreateNoteCategoryBody,
): Promise<PostCategoryResponse> {
  const response = await fetch("/api/notes/categories", {
    method: "POST",
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
      errorBody?.error ?? "Failed to create note category.",
    ) as Error & { code?: string; status?: number };
    error.status = response.status;
    error.code = errorBody?.code;
    throw error;
  }

  return response.json() as Promise<PostCategoryResponse>;
}
