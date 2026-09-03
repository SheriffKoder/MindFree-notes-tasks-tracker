/**
 * @file entities/note/category/cache/synchronize-note-category-caches.ts
 * Pure helpers that keep category + dependent note caches consistent after CRUD.
 *
 * Purpose: Mutation onSuccess patches for category create/update/soft/hard/restore.
 * Used in: entities/note/category/hooks/*-mutation.ts
 * Used for: Active + withDeleted lists; purge generalNotes; strip Home on membership change.
 *
 * Steps (hard delete):
 * 1. Remove category from both category query caches
 * 2. removeQueries for that category's generalNotes key
 * 3. Drop matching Home strip; invalidate homeNotes for safety
 */

import type { QueryClient } from "@tanstack/react-query";

import type { NoteCategoriesResponse } from "@/entities/note/category/queries";
import type { NoteCategory } from "@/entities/note/category/model/types";
import {
  noteCategoriesQueryKey,
  noteCategoriesWithDeletedQueryKey,
} from "@/entities/note/category/client/query-keys";
import { generalNotesQueryKey, homeNotesQueryKey } from "@/entities/note/client/query-keys";
import type { HomeNotesResponse } from "@/entities/note/model/read-models";

/////////////////////////////////////////////////////////////
// Shared list patchers — upsert / remove by category id
/////////////////////////////////////////////////////////////

/**
 * Upserts a category into a categories payload (sorted by sortOrder then name).
 */
function upsertCategoryInList(
  current: NoteCategoriesResponse | undefined,
  category: NoteCategory,
): NoteCategoriesResponse {
  const categories = current?.categories ?? [];
  const without = categories.filter((entry) => entry.id !== category.id);
  const next = [...without, category].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.name.localeCompare(right.name);
  });

  return { categories: next };
}

/**
 * Removes a category id from a categories payload.
 */
function removeCategoryFromList(
  current: NoteCategoriesResponse | undefined,
  categoryId: string,
): NoteCategoriesResponse | undefined {
  if (!current) {
    return current;
  }

  return {
    categories: current.categories.filter((entry) => entry.id !== categoryId),
  };
}

/**
 * Drops the Home strip for a category id when present.
 */
function removeHomeStrip(
  current: HomeNotesResponse | undefined,
  categoryId: string,
): HomeNotesResponse | undefined {
  if (!current) {
    return current;
  }

  return {
    strips: current.strips.filter((strip) => strip.categoryId !== categoryId),
  };
}

/////////////////////////////////////////////////////////////
// Public mutation cache helpers
/////////////////////////////////////////////////////////////

/**
 * After create — insert into active list; refresh withDeleted if hydrated.
 */
export function applyCategoryCreateToCaches(
  queryClient: QueryClient,
  category: NoteCategory,
): void {
  // Active list always gains the new category
  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesQueryKey,
    (current) => upsertCategoryInList(current, category),
  );

  // Keep manage-drawer cache in sync when present
  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesWithDeletedQueryKey,
    (current) =>
      current ? upsertCategoryInList(current, category) : current,
  );

  // showOnHome membership may add a strip — invalidate rather than invent empty strip fields
  if (category.showOnHome) {
    void queryClient.invalidateQueries({ queryKey: homeNotesQueryKey });
  }
}

/**
 * After update — patch both category lists; invalidate Home when showOnHome may change.
 */
export function applyCategoryUpdateToCaches(
  queryClient: QueryClient,
  category: NoteCategory,
): void {
  const isActive = category.deletedAt == null;

  if (isActive) {
    queryClient.setQueryData<NoteCategoriesResponse>(
      noteCategoriesQueryKey,
      (current) => upsertCategoryInList(current, category),
    );
  } else {
    // Soft-deleted rows leave the active switcher list
    queryClient.setQueryData<NoteCategoriesResponse>(
      noteCategoriesQueryKey,
      (current) => removeCategoryFromList(current, category.id),
    );
  }

  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesWithDeletedQueryKey,
    (current) =>
      current ? upsertCategoryInList(current, category) : current,
  );

  // Home strips depend on showOnHome + name denormalization
  void queryClient.invalidateQueries({ queryKey: homeNotesQueryKey });
}

/**
 * After soft delete — remove from active; upsert archived into withDeleted; drop Home strip.
 * Keeps generalNotes cache (notes still exist; view is hidden until restore/hard).
 */
export function applyCategorySoftDeleteToCaches(
  queryClient: QueryClient,
  category: NoteCategory,
): void {
  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesQueryKey,
    (current) => removeCategoryFromList(current, category.id),
  );

  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesWithDeletedQueryKey,
    (current) => upsertCategoryInList(current, category),
  );

  // Hide Home strip immediately; keep generalNotes for potential restore
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) =>
    removeHomeStrip(current, category.id),
  );
}

/**
 * After restore — add back to active; patch withDeleted; invalidate Home if showOnHome.
 */
export function applyCategoryRestoreToCaches(
  queryClient: QueryClient,
  category: NoteCategory,
): void {
  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesQueryKey,
    (current) => upsertCategoryInList(current, category),
  );

  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesWithDeletedQueryKey,
    (current) =>
      current ? upsertCategoryInList(current, category) : current,
  );

  if (category.showOnHome) {
    void queryClient.invalidateQueries({ queryKey: homeNotesQueryKey });
  }
}

/**
 * After hard delete — purge category lists, generalNotes for that id, and Home strip.
 */
export function applyCategoryHardDeleteToCaches(
  queryClient: QueryClient,
  categoryId: string,
): void {
  // 1. Remove from both category caches
  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesQueryKey,
    (current) => removeCategoryFromList(current, categoryId),
  );
  queryClient.setQueryData<NoteCategoriesResponse>(
    noteCategoriesWithDeletedQueryKey,
    (current) => removeCategoryFromList(current, categoryId),
  );

  // 2. Notes under this category were cascaded — drop the undated list cache
  queryClient.removeQueries({ queryKey: generalNotesQueryKey(categoryId) });

  // 3. Drop Home strip for this category
  queryClient.setQueryData<HomeNotesResponse>(homeNotesQueryKey, (current) =>
    removeHomeStrip(current, categoryId),
  );

  // Safety net for any denormalized strip state we missed
  void queryClient.invalidateQueries({ queryKey: homeNotesQueryKey });
}
