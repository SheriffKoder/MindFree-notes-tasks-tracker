/**
 * @file entities/note/category/transform/map-category-row.ts
 * Maps Supabase note category rows to domain `NoteCategory` objects.
 */

import type {
  NoteCategory,
  NoteCategoryRow,
} from "@/entities/note/category/model/types";

/**
 * Maps a Supabase note category row to the domain `NoteCategory` type.
 */
export function mapNoteCategoryRow(row: NoteCategoryRow): NoteCategory {
  return {
    id: row.id,
    name: row.name,
    showOnHome: row.show_on_home,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
