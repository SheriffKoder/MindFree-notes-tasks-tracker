/**
 * @file features/notes/note-category-drawer/lib/map-category-api-error.ts
 * Maps category API/mutation errors onto user-facing copy.
 *
 * Purpose: One place for 409 name conflict and 403 Diary-protected messages.
 * Used in: features/notes/note-category-drawer UI actions
 * Used for: Inline drawer error banner — no toasts in this slice.
 */

/**
 * Returns a friendly message for category write failures.
 *
 * @param error - thrown mutation/fetcher error (`code` / `status` when present)
 */
export function mapCategoryApiError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : undefined;
  const status =
    error && typeof error === "object" && "status" in error
      ? Number((error as { status?: number }).status)
      : undefined;

  if (code === "CATEGORY_NAME_CONFLICT" || status === 409) {
    return "A category with this name already exists";
  }

  if (code === "DEFAULT_CATEGORY_PROTECTED" || status === 403) {
    return error instanceof Error
      ? error.message
      : "The default Diary category cannot be permanently deleted.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Try again.";
}
