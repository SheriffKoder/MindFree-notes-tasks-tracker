/**
 * @file entities/note/category/client/delete-category.ts
 * Client DELETE fetcher for soft or hard category deletion.
 *
 * Purpose: HTTP write used by soft/hard delete mutations.
 * Used in: category hooks for archive + permanent delete
 * Used for: Soft by default; `hard=1` cascades notes.
 */

/**
 * Soft-deletes a category (archive). Notes remain until hard delete.
 */
export async function fetchSoftDeleteNoteCategory(id: string): Promise<void> {
  const response = await fetch(
    `/api/notes/categories/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      code?: string;
    } | null;
    const error = new Error(
      errorBody?.error ?? "Failed to delete note category.",
    ) as Error & { code?: string; status?: number };
    error.status = response.status;
    error.code = errorBody?.code;
    throw error;
  }
}

/**
 * Permanently deletes a category and cascades its notes.
 */
export async function fetchHardDeleteNoteCategory(id: string): Promise<void> {
  const response = await fetch(
    `/api/notes/categories/${encodeURIComponent(id)}?hard=1`,
    {
      method: "DELETE",
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      code?: string;
    } | null;
    const error = new Error(
      errorBody?.error ?? "Failed to permanently delete note category.",
    ) as Error & { code?: string; status?: number };
    error.status = response.status;
    error.code = errorBody?.code;
    throw error;
  }
}
