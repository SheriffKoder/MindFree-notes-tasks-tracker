/**
 * @file entities/note/editor/ui/note-form.tsx
 * Plain note editor — composes title row and description row.
 */

"use client";

import { NOTE_FORM_CSS_VARS } from "@/entities/note/editor/lib/note-form-classes";
import { useNoteForm } from "@/entities/note/editor/model/use-note-form";
import type { NoteFormProps } from "@/entities/note/editor/model/types";
import { NoteFormContentRow } from "@/entities/note/editor/ui/note-form-content-row";
import { NoteFormTitleRow } from "@/entities/note/editor/ui/note-form-title-row";

/**
 * Controlled note editor for the drawer shell.
 *
 * Layout:
 * - Row 1: plain title + star / important toggles
 * - Row 2: plain scrollable description with last-saved in the bottom-right
 */
export function NoteForm({
  note,
  onChange,
  saveStatus = "idle",
}: NoteFormProps) {
  const {
    values,
    errors,
    formattedLastEditedAt,
    setTitle,
    setContent,
    toggleStarred,
    toggleImportant,
  } = useNoteForm({ note, onChange });

  return (
    <form
      className="flex min-h-full flex-col gap-3"
      noValidate
      style={NOTE_FORM_CSS_VARS}
      onSubmit={(event) => event.preventDefault()}
    >
      <NoteFormTitleRow
        errors={errors}
        values={values}
        onTitleChange={setTitle}
        onToggleImportant={toggleImportant}
        onToggleStarred={toggleStarred}
      />

      <NoteFormContentRow
        content={values.content}
        contentError={errors.content}
        formattedLastEditedAt={formattedLastEditedAt}
        saveStatus={saveStatus}
        onContentChange={setContent}
      />
    </form>
  );
}
