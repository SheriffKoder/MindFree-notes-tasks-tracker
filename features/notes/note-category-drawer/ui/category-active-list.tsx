/**
 * @file features/notes/note-category-drawer/ui/category-active-list.tsx
 * Active (non-archived) category rows for the manage drawer.
 *
 * Purpose: Present name, Home toggle, edit, and archive — no hard delete here.
 * Used in: features/notes/note-category-drawer/ui/note-category-drawer.tsx
 * Used for: sort_order list; Diary shows a Default badge.
 *
 * Steps:
 * 1. Render each active category
 * 2. Toggle showOnHome immediately via PATCH
 * 3. Edit / archive callbacks stay in the parent
 */

"use client";

import { Archive, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { NoteCategory } from "@/entities/note/client";

export interface CategoryActiveListProps {
  categories: NoteCategory[];
  /** Category currently in the edit form — row Home toggle is disabled. */
  editingCategoryId?: string | null;
  togglingId?: string | null;
  archivingId?: string | null;
  onToggleShowOnHome: (category: NoteCategory, showOnHome: boolean) => void;
  onEdit: (categoryId: string) => void;
  onArchive: (category: NoteCategory) => void;
}

/**
 * Renders the active category list with Home / edit / archive controls.
 */
export function CategoryActiveList({
  categories,
  editingCategoryId = null,
  togglingId = null,
  archivingId = null,
  onToggleShowOnHome,
  onEdit,
  onArchive,
}: CategoryActiveListProps) {
  if (categories.length === 0) {
    return (
      <p className="text-sm [color:var(--color-fg-muted)]">
        No active categories.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {categories.map((category) => {
        const homeId = `show-on-home-${category.id}`;
        const isEditing = editingCategoryId === category.id;
        const isBusy =
          togglingId === category.id || archivingId === category.id;

        return (
          <li
            key={category.id}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 [background-color:color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium [color:var(--color-fg)]">
                  {category.name}
                </span>
                {category.isDefault ? (
                  <Badge variant="secondary">Default</Badge>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Checkbox
                  checked={category.showOnHome}
                  disabled={isBusy || isEditing}
                  id={homeId}
                  onCheckedChange={(checked) => {
                    onToggleShowOnHome(category, checked === true);
                  }}
                />
                <Label
                  className="text-caption font-normal [color:var(--color-fg-muted)]"
                  htmlFor={homeId}
                >
                  Home
                </Label>
              </div>

              <Button
                aria-label={`Edit ${category.name}`}
                disabled={isBusy}
                size="icon"
                title="Edit category"
                type="button"
                variant="ghost"
                onClick={() => onEdit(category.id)}
              >
                <Pencil className="h-4 w-4 [color:var(--color-fg-muted)]" />
              </Button>

              <Button
                aria-label={`Archive ${category.name}`}
                disabled={isBusy}
                size="icon"
                title="Archive category"
                type="button"
                variant="ghost"
                onClick={() => onArchive(category)}
              >
                <Archive className="h-4 w-4 [color:var(--color-fg-muted)]" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
