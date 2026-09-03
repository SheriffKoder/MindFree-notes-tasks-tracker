/**
 * @file features/notes/note-category-drawer/ui/category-delete-confirm.tsx
 * Hard-delete confirmation panel for a non-Diary category.
 *
 * Purpose: Require an explicit confirm before cascading notes.
 * Used in: features/notes/note-category-drawer/ui/note-category-drawer.tsx
 * Used for: Permanent delete copy + Cancel / Delete forever actions.
 */

"use client";

import { Button } from "@/components/ui/button";
import type { NoteCategory } from "@/entities/note/client";

export interface CategoryDeleteConfirmProps {
  category: NoteCategory;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirms permanent deletion of a category and all of its notes.
 */
export function CategoryDeleteConfirm({
  category,
  isPending,
  onCancel,
  onConfirm,
}: CategoryDeleteConfirmProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] px-3 py-3 [background-color:color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
      role="alertdialog"
      aria-labelledby="hard-delete-category-title"
      aria-describedby="hard-delete-category-copy"
    >
      <h3
        className="text-sm font-medium [color:var(--color-fg)]"
        id="hard-delete-category-title"
      >
        Delete category
      </h3>
      <p
        className="text-sm [color:var(--color-fg-muted)]"
        id="hard-delete-category-copy"
      >
        Permanently delete <strong>{category.name}</strong> and all of its
        notes? This cannot be undone.
      </p>
      <div className="flex items-center justify-end gap-2">
        <Button
          disabled={isPending}
          size="sm"
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={isPending}
          size="sm"
          type="button"
          variant="destructive"
          onClick={onConfirm}
        >
          {isPending ? "Deleting…" : "Delete forever"}
        </Button>
      </div>
    </div>
  );
}
