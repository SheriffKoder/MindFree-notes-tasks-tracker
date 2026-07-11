/**
 * @file entities/note/editor/ui/note-form-title-row.tsx
 * Row 1 — plain title input with star and important toggles.
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
          values={values}
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
