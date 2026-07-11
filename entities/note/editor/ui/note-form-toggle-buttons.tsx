/**
 * @file entities/note/editor/ui/note-form-toggle-buttons.tsx
 * Star and important toggles for the note editor title row.
 */

import { Bookmark, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NoteFormValues } from "@/entities/note/editor/model/types";

export interface NoteFormToggleButtonsProps {
  values: Pick<NoteFormValues, "starred" | "isImportant">;
  onToggleStarred: () => void;
  onToggleImportant: () => void;
}

/**
 * Renders star and important icon toggles beside the title field.
 */
export function NoteFormToggleButtons({
  values,
  onToggleStarred,
  onToggleImportant,
}: NoteFormToggleButtonsProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        aria-label={values.starred ? "Unstar note" : "Star note"}
        aria-pressed={values.starred}
        className="shrink-0"
        size="icon"
        type="button"
        variant="ghost"
        onClick={onToggleStarred}
      >
        <Star
          className={cn(
            "h-4 w-4",
            values.starred
              ? "fill-current [color:var(--note-form-star-active)]"
              : "[color:var(--note-form-star-inactive)]",
          )}
        />
      </Button>

      <Button
        aria-label={
          values.isImportant ? "Unmark as important" : "Mark as important"
        }
        aria-pressed={values.isImportant}
        className="shrink-0"
        size="icon"
        type="button"
        variant="ghost"
        onClick={onToggleImportant}
      >
        <Bookmark
          className={cn(
            "h-4 w-4",
            values.isImportant
              ? "fill-current [color:var(--note-form-important-active)]"
              : "[color:var(--note-form-important-inactive)]",
          )}
        />
      </Button>
    </div>
  );
}
