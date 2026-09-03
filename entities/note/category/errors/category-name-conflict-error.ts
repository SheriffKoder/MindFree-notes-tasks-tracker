/**
 * @file entities/note/category/errors/category-name-conflict-error.ts
 * Typed error when an active category name already exists for the user.
 */

export class CategoryNameConflictError extends Error {
  readonly code = "CATEGORY_NAME_CONFLICT" as const;

  constructor(message = "A category with this name already exists.") {
    super(message);
    this.name = "CategoryNameConflictError";
  }
}
