/**
 * @file entities/note/category/client.ts
 * Client-side barrel for the note category nest.
 *
 * Import via `@/entities/note/client` from views — this file is the nest surface
 * that the parent note client re-exports.
 */

export {
  noteCategoriesQueryKey,
  noteCategoriesWithDeletedQueryKey,
  noteCategoriesKeyFor,
  fetchNoteCategories,
  noteCategoriesQueryOptions,
  fetchPostNoteCategory,
  fetchPatchNoteCategory,
  fetchSoftDeleteNoteCategory,
  fetchHardDeleteNoteCategory,
  fetchRestoreNoteCategory,
} from "@/entities/note/category/client/index";
export {
  useNoteCategoriesQuery,
  useCreateNoteCategoryMutation,
  useUpdateNoteCategoryMutation,
  useSoftDeleteNoteCategoryMutation,
  useRestoreNoteCategoryMutation,
  useHardDeleteNoteCategoryMutation,
} from "@/entities/note/category/hooks";
export type {
  UseNoteCategoriesQueryOptions,
  CreateNoteCategoryMutationInput,
  UpdateNoteCategoryMutationInput,
  SoftDeleteNoteCategoryMutationInput,
  RestoreNoteCategoryMutationInput,
  HardDeleteNoteCategoryMutationInput,
} from "@/entities/note/category/hooks";
export type { NoteCategory } from "@/entities/note/category/model/types";
export type { NoteCategoriesResponse } from "@/entities/note/category/queries";
export { seedNoteCategoriesCache } from "@/entities/note/category/hydration/seed-note-categories-cache";
