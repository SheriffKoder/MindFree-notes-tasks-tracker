/**
 * @file features/notes/note-category-drawer/ui/category-archived-list.tsx
 * Soft-deleted category rows — restore or hard-delete.
 *
 * Purpose: Archived list until restore; Diary never shows hard delete.
 * Used in: features/notes/note-category-drawer/ui/note-category-drawer.tsx
 * Used for: Restore + Delete forever (confirm is a sibling panel).
 */

"use client";

import { RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NoteCategory } from "@/entities/note/client";

export interface CategoryArchivedListProps {
  categories: NoteCategory[];
  restoringId?: string | null;
  onRestore: (category: NoteCategory) => void;
  onHardDelete: (category: NoteCategory) => void;
}

/**
 * Renders archived categories with Restore and optional hard-delete.
 */
export function CategoryArchivedList({
  categories,
  restoringId = null,
  onRestore,
  onHardDelete,
}: CategoryArchivedListProps) {
  if (categories.length === 0) {
    return (
      <p className="text-sm [color:var(--color-fg-muted)]">
        No archived categories.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {categories.map((category) => {
        const isBusy = restoringId === category.id;

        return (
          <li
            key={category.id}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 [background-color:color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium [color:var(--color-fg-muted)]">
                  {category.name}
                </span>
                {category.isDefault ? (
                  <Badge variant="secondary">Default</Badge>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                aria-label={`Restore ${category.name}`}
                disabled={isBusy}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onRestore(category)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>

              {category.isDefault ? null : (
                <Button
                  aria-label={`Permanently delete ${category.name}`}
                  disabled={isBusy}
                  size="icon"
                  title="Delete forever"
                  type="button"
                  variant="ghost"
                  onClick={() => onHardDelete(category)}
                >
                  <Trash2 className="h-4 w-4 [color:var(--color-error)]" />
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
