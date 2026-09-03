/**
 * @file entities/note/category/repository/index.ts
 * Public repository surface for note category persistence.
 */

export { getCategories } from "@/entities/note/category/repository/get-categories";
export { getCategoryById } from "@/entities/note/category/repository/get-category-by-id";
export { createCategory } from "@/entities/note/category/repository/create-category";
export { updateCategory } from "@/entities/note/category/repository/update-category";
export { softDeleteCategory } from "@/entities/note/category/repository/soft-delete-category";
export { restoreCategory } from "@/entities/note/category/repository/restore-category";
export { hardDeleteCategory } from "@/entities/note/category/repository/hard-delete-category";
export { ensureDefaultCategory } from "@/entities/note/category/repository/ensure-default-category";
