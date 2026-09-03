/**
 * @file entities/note/client/note-categories-query.ts
 * Re-export shim — ownership moved to `entities/note/category/client`.
 *
 * Kept so older note-client deep imports continue to resolve during Phase 05.
 */

export {
  fetchNoteCategories,
  noteCategoriesQueryOptions,
} from "@/entities/note/category/client/categories-query";
