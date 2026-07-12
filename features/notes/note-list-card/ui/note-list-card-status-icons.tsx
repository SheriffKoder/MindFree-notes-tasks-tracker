/**
 * @file features/notes/note-list-card/ui/note-list-card-status-icons.tsx
 * Read-only bookmark + star indicators for list cards.
 */

import { Bookmark, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Note } from "@/entities/note";

export interface NoteListCardStatusIconsProps {
  note: Pick<Note, "starred" | "isImportant">;
  className?: string;
}

/**
 * Renders bookmark then star on the card top-right (inactive icons stay muted).
 */
export function NoteListCardStatusIcons({
  note,
  className,
}: NoteListCardStatusIconsProps) {
  return (
    <div
      className={cn("absolute flex items-center gap-1", className)}
      aria-hidden
    >
      <Bookmark
        className={cn(
          "h-4 w-4",
          note.isImportant
            ? "fill-current [color:var(--note-cell-important-icon)]"
            : "[color:var(--note-card-icon-inactive)]",
        )}
      />
      <Star
        className={cn(
          "h-4 w-4",
          note.starred
            ? "fill-current [color:var(--note-card-star)]"
            : "[color:var(--note-card-icon-inactive)]",
        )}
      />
    </div>
  );
}
