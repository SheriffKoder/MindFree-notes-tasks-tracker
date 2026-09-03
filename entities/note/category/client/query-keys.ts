/**
 * @file entities/note/category/client/query-keys.ts
 * TanStack Query keys owned by the note-category nest.
 *
 * Purpose: Stable keys for active vs archived category lists.
 * Used in: category query options, mutations, note client re-exports
 * Used for: Active list (Notes/Home) vs `withDeleted` (manage drawer).
 */

/** Active note categories — Notes switcher, Home, add dropdown. */
export const noteCategoriesQueryKey = ["noteCategories"] as const;

/** Active + soft-deleted categories — manage drawer archive list. */
export const noteCategoriesWithDeletedQueryKey = [
  "noteCategories",
  "withDeleted",
] as const;

/**
 * Resolves the categories query key for the includeDeleted flag.
 */
export function noteCategoriesKeyFor(includeDeleted: boolean) {
  return includeDeleted
    ? noteCategoriesWithDeletedQueryKey
    : noteCategoriesQueryKey;
}
