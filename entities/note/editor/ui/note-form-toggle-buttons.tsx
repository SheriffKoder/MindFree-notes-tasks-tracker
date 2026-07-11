/**
 * @file entities/note/editor/ui/note-form-toggle-buttons.tsx
 * Star, important, and calendar date-picker toggles for the title row.
 *
 * Purpose: Dumb action buttons — picker records intent; orchestrator saves later.
 * Used in: entities/note/editor/ui/note-form-title-row.tsx
 * Used for: Star/important toggles and optional NoteDatePickerTrigger (Step 11).
 */

import { Bookmark, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NoteFormValues } from "@/entities/note/editor/model/types";
import { NoteDatePickerTrigger } from "@/entities/note/editor/ui/note-date-picker-trigger";

export interface NoteFormToggleButtonsProps {
  values: Pick<NoteFormValues, "title" | "starred" | "isImportant">;
  onToggleStarred: () => void;
  onToggleImportant: () => void;
  /** When set, renders the calendar picker left of the star toggle. */
  onDatePick?: (isoDate: string) => void;
}

/**
 * Renders star and important icon toggles beside the title field.
 */
export function NoteFormToggleButtons({
  values,
  onToggleStarred,
  onToggleImportant,
  onDatePick,
}: NoteFormToggleButtonsProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {onDatePick ? (
        <NoteDatePickerTrigger
          currentTitle={values.title}
          onPick={onDatePick}
        />
      ) : null}

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
