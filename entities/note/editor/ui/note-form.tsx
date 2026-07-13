/**
 * @file entities/note/editor/ui/note-form.tsx
 * Plain note editor — composes title row and description row.
 *
 * Purpose: Dumb editor shell; delegates save routing to the drawer orchestrator.
 * Used in: features/notes/note-drawer/ui/note-drawer.tsx
 * Used for: Title/content editing, footer meta, and date-picker callback wiring.
 */

"use client";

import { useCallback, useEffect } from "react";

import { cn } from "@/lib/utils";
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
 * - Row 2: plain scrollable description (optional overlaid last-saved)
 */
export function NoteForm({
  note,
  resetKey,
  commitKey = 0,
  calendarDate = null,
  onChange,
  onDatePick,
  remoteSyncKey = 0,
  saveStatus = "idle",
  showContentLastSaved = true,
  onFooterMetaChange,
  onDelete,
  isQuickNote = false,
  onSetQuick,
  className,
}: NoteFormProps) {
  const {
    values,
    errors,
    formattedLastEditedAt,
    setTitle,
    setContent,
    toggleStarred,
    toggleImportant,
  } = useNoteForm({ note, resetKey, commitKey, calendarDate, remoteSyncKey, onChange });

  const handleDatePick = useCallback(
    (isoDate: string) => {
      const title = onDatePick?.(isoDate);

      if (title) {
        setTitle(title);
      }
    },
    [onDatePick, setTitle],
  );

  useEffect(() => {
    onFooterMetaChange?.({
      formattedLastEditedAt,
      saveStatus,
    });
  }, [formattedLastEditedAt, onFooterMetaChange, saveStatus]);

  return (
    <form
      className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}
      noValidate
      style={NOTE_FORM_CSS_VARS}
      onSubmit={(event) => event.preventDefault()}
    >
      <NoteFormTitleRow
        errors={errors}
        isQuickNote={isQuickNote}
        values={values}
        onDatePick={onDatePick ? handleDatePick : undefined}
        onSetQuick={onSetQuick}
        selectedDate={note?.date ?? calendarDate}
        onDelete={onDelete}
        onTitleChange={setTitle}
        onToggleImportant={toggleImportant}
        onToggleStarred={toggleStarred}
      />

      <NoteFormContentRow
        content={values.content}
        contentError={errors.content}
        formattedLastEditedAt={formattedLastEditedAt}
        saveStatus={saveStatus}
        showLastSaved={showContentLastSaved}
        onContentChange={setContent}
      />
    </form>
  );
}
