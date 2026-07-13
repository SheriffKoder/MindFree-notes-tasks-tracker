/**
 * @file views/notes/ui/notes-add-button.tsx
 * Icon-only control that opens the note editor drawer for a new note.
 *
 * Purpose: Primary create entry on the Notes page toolbar.
 * Used in: views/notes/ui/notes-client.tsx
 * Used for: Lazy general-note create — drawer opens; row is created on first save.
 */

"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NotesAddButtonProps {
  /** Opens the drawer in general-note create mode. */
  onClick: () => void;
  className?: string;
}

/**
 * Renders a compact "+" button beside the view switcher.
 * Chrome matches {@link ViewSwitcherDesktop} — bordered surface pill, ghost icon.
 * No visible label — `aria-label` carries the accessible name.
 */
export function NotesAddButton({ onClick, className }: NotesAddButtonProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <Button
        aria-label="Add note"
        className="shrink-0"
        size="icon"
        title="Add note"
        type="button"
        variant="ghost"
        onClick={onClick}
      >
        <Plus aria-hidden className="h-4 w-4 [color:var(--color-fg-muted)]" />
      </Button>
    </div>
  );
}
