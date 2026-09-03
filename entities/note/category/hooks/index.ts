/**
 * @file entities/note/category/hooks/index.ts
 * Segment barrel for note-category React query + mutation hooks.
 */

export {
  useNoteCategoriesQuery,
  type UseNoteCategoriesQueryOptions,
} from "@/entities/note/category/hooks/use-note-categories-query";
export {
  useCreateNoteCategoryMutation,
  type CreateNoteCategoryMutationInput,
} from "@/entities/note/category/hooks/use-create-note-category-mutation";
export {
  useUpdateNoteCategoryMutation,
  type UpdateNoteCategoryMutationInput,
} from "@/entities/note/category/hooks/use-update-note-category-mutation";
export {
  useSoftDeleteNoteCategoryMutation,
  type SoftDeleteNoteCategoryMutationInput,
} from "@/entities/note/category/hooks/use-soft-delete-note-category-mutation";
export {
  useRestoreNoteCategoryMutation,
  type RestoreNoteCategoryMutationInput,
} from "@/entities/note/category/hooks/use-restore-note-category-mutation";
export {
  useHardDeleteNoteCategoryMutation,
  type HardDeleteNoteCategoryMutationInput,
} from "@/entities/note/category/hooks/use-hard-delete-note-category-mutation";
