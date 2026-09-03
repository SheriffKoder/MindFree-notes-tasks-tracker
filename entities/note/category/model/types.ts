/**
 * @file entities/note/category/model/types.ts
 * Domain and DB-row types for note categories.
 */

export interface NoteCategory {
  id: string;
  name: string;
  showOnHome: boolean;
  sortOrder: number;
  /** Seeded Diary — hard delete forbidden. */
  isDefault: boolean;
  /** ISO timestamp when soft-deleted; null when active. */
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCategoryRow {
  id: string;
  user_id: string;
  name: string;
  show_on_home: boolean;
  sort_order: number;
  is_default: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
