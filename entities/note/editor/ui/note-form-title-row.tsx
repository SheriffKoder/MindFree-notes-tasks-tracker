/**
 * @file entities/note/editor/ui/note-form-title-row.tsx
 * Row 1 — plain title input with star, important, and date-picker toggles.
 *
 * Purpose: Render editable title and delegate picker intent to onDatePick.
 * Used in: entities/note/editor/ui/note-form.tsx
 * Used for: Calendar icon trigger alongside star/important controls.
 */

import { PLAIN_TITLE_CLASS } from "@/entities/note/editor/lib/note-form-classes";
import type { NoteFormFieldErrors, NoteFormValues } from "@/entities/note/editor/model/types";
import { NoteFormToggleButtons } from "@/entities/note/editor/ui/note-form-toggle-buttons";

export interface NoteFormTitleRowProps {
  values: Pick<NoteFormValues, "title" | "starred" | "isImportant">;
  errors: Pick<NoteFormFieldErrors, "title">;
  onTitleChange: (title: string) => void;
  onToggleStarred: () => void;
  onToggleImportant: () => void;
  /** When set, shows the calendar date picker beside the toggles. */
  onDatePick?: (isoDate: string) => void;
  /** Bound calendar date for the dropdown picker (`YYYY-MM-DD`). */
  selectedDate?: string | null;
  /** When set, shows a delete control on the title row. */
  onDelete?: () => void;
  /** Hides star/important for the home quick-note slot. */
  isQuickNote?: boolean;
  /** When set, shows house-plus to promote into the quick slot. */
  onSetQuick?: () => void;
}

/**
 * Title row with inline validation for the title field.
 */
export function NoteFormTitleRow({
  values,
  errors,
  onTitleChange,
  onToggleStarred,
  onToggleImportant,
  onDatePick,
  selectedDate,
  onDelete,
  isQuickNote,
  onSetQuick,
}: NoteFormTitleRowProps) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          aria-invalid={Boolean(errors.title)}
          className={PLAIN_TITLE_CLASS}
          name="title"
          placeholder="Title"
          type="text"
          value={values.title}
          onChange={(event) => onTitleChange(event.target.value)}
        />

        <NoteFormToggleButtons
          isQuickNote={isQuickNote}
          values={values}
          onDatePick={onDatePick}
          onSetQuick={onSetQuick}
          selectedDate={selectedDate}
          onDelete={onDelete}
          onToggleImportant={onToggleImportant}
          onToggleStarred={onToggleStarred}
        />
      </div>

      {errors.title ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {errors.title}
        </p>
      ) : null}
    </div>
  );
}
