/**
 * @file entities/note/editor/ui/note-form-title-row.tsx
 * Row 1 — plain title input with category, calendar, star, and important toggles.
 *
 * Purpose: Render editable title and delegate picker intent to onDatePick.
 * Used in: entities/note/editor/ui/note-form.tsx
 * Used for: Category dropdown left of the calendar trigger alongside star/important.
 */

import { PLAIN_TITLE_CLASS } from "@/entities/note/editor/lib/note-form-classes";
import type { NoteFormFieldErrors, NoteFormValues } from "@/entities/note/editor/model/types";
import type { NoteFormCategoryOption } from "@/entities/note/editor/ui/note-form-category-select";
import { NoteFormToggleButtons } from "@/entities/note/editor/ui/note-form-toggle-buttons";

export interface NoteFormTitleRowProps {
  values: Pick<NoteFormValues, "title" | "starred" | "isImportant">;
  errors: Pick<NoteFormFieldErrors, "title" | "categoryId">;
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
  /** Active categories for the in-header picker (undated notes only). */
  categories?: NoteFormCategoryOption[];
  /** Selected undated category id. */
  categoryId?: string | null;
  /** When false, calendar notes hide the category picker. */
  showCategorySelect?: boolean;
  /** Persists the chosen category in local form state. */
  onCategoryChange?: (categoryId: string) => void;
}

/**
 * Title row with the title field and all picker/toggle buttons on one line.
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
  categories,
  categoryId,
  showCategorySelect,
  onCategoryChange,
}: NoteFormTitleRowProps) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          aria-invalid={Boolean(errors.title)}
          className={PLAIN_TITLE_CLASS}
          name="title"
          placeholder={isQuickNote ? "Quick note (title graduates it)" : "Add a title…"}
          type="text"
          value={values.title}
          onChange={(event) => onTitleChange(event.target.value)}
        />

        <NoteFormToggleButtons
          categories={categories}
          categoryError={errors.categoryId}
          categoryId={categoryId}
          isQuickNote={isQuickNote}
          showCategorySelect={showCategorySelect}
          values={values}
          onCategoryChange={onCategoryChange}
          onDatePick={onDatePick}
          onSetQuick={onSetQuick}
          selectedDate={selectedDate}
          onDelete={onDelete}
          onToggleImportant={onToggleImportant}
          onToggleStarred={onToggleStarred}
        />
      </div>

      {errors.categoryId ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {errors.categoryId}
        </p>
      ) : null}

      {errors.title ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {errors.title}
        </p>
      ) : !isQuickNote && !values.title.trim() ? (
        <p className="text-caption [color:var(--color-fg-hint)]">
          A title helps find this note later. Date turns it into a calendar note.
        </p>
      ) : null}
    </div>
  );
}
