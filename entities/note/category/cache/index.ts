/**
 * @file entities/note/category/cache/index.ts
 * Segment barrel for note-category TanStack cache helpers.
 */

export {
  applyCategoryCreateToCaches,
  applyCategoryUpdateToCaches,
  applyCategorySoftDeleteToCaches,
  applyCategoryRestoreToCaches,
  applyCategoryHardDeleteToCaches,
} from "@/entities/note/category/cache/synchronize-note-category-caches";
