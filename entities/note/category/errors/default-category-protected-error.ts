/**
 * @file entities/note/category/errors/default-category-protected-error.ts
 * Typed error when hard-deleting the seeded Diary category.
 */

export class DefaultCategoryProtectedError extends Error {
  readonly code = "DEFAULT_CATEGORY_PROTECTED" as const;

  constructor(message = "The default Diary category cannot be permanently deleted.") {
    super(message);
    this.name = "DefaultCategoryProtectedError";
  }
}
