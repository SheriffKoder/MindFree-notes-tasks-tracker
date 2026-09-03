/**
 * @file views/notes/ui/notes-manage-categories-button.tsx
 * Icon-only control that opens the category manage drawer.
 *
 * Purpose: Toolbar entry next to the view switcher for category CRUD.
 * Used in: views/notes/ui/notes-client.tsx
 * Used for: Open/close is owned by useNoteCategoriesDrawer.
 */

"use client";

import { FolderCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NotesManageCategoriesButtonProps {
  /** Opens the category manage drawer. */
  onClick: () => void;
  className?: string;
}

/**
 * Renders a compact folder/settings button beside the view switcher.
 * Chrome matches {@link NotesAddButton}.
 */
export function NotesManageCategoriesButton({
  onClick,
  className,
}: NotesManageCategoriesButtonProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <Button
        aria-label="Manage categories"
        className="shrink-0"
        size="icon"
        title="Manage categories"
        type="button"
        variant="ghost"
        onClick={onClick}
      >
        <FolderCog
          aria-hidden
          className="h-4 w-4 [color:var(--color-fg-muted)]"
        />
      </Button>
    </div>
  );
}
