/**
 * @file entities/note/category/client/index.ts
 * Segment barrel for note-category browser fetchers and query keys.
 */

export {
  noteCategoriesQueryKey,
  noteCategoriesWithDeletedQueryKey,
  noteCategoriesKeyFor,
} from "@/entities/note/category/client/query-keys";
export {
  fetchNoteCategories,
  noteCategoriesQueryOptions,
} from "@/entities/note/category/client/categories-query";
export {
  fetchPostNoteCategory,
  type PostCategoryResponse,
} from "@/entities/note/category/client/post-category";
export {
  fetchPatchNoteCategory,
  type PatchCategoryResponse,
} from "@/entities/note/category/client/patch-category";
export {
  fetchSoftDeleteNoteCategory,
  fetchHardDeleteNoteCategory,
} from "@/entities/note/category/client/delete-category";
export {
  fetchRestoreNoteCategory,
  type RestoreCategoryResponse,
} from "@/entities/note/category/client/restore-category";
