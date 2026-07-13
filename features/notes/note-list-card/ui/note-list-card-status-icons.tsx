/**
 * @file features/notes/note-list-card/ui/note-list-card-status-icons.tsx
 * Read-only bookmark + star indicators for list cards.
 */

import { Bookmark, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Note } from "@/entities/note";

export interface NoteListCardStatusIconsProps {
  note: Pick<Note, "starred" | "isImportant" | "isQuick">;
  className?: string;
  /** `corner` — absolute within the card shell; `inline` — flows in a footer row. */
  layout?: "corner" | "inline";
}

/**
 * Renders bookmark then star (inactive icons stay muted).
 */
export function NoteListCardStatusIcons({
  note,
  className,
  layout = "corner",
}: NoteListCardStatusIconsProps) {
  if (note.isQuick) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        layout === "corner" && "absolute",
        className,
      )}
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
