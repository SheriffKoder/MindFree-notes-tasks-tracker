/**
 * @file entities/note/editor/model/use-note-form.ts
 * Local field state, dirty tracking, and validation for the note editor.
 *
 * Purpose: Own form state only — no network I/O or save routing.
 * Used in: entities/note/editor/ui/note-form.tsx
 * Used for: Controlled fields, dirty/valid meta, and calendar title prefill on reset.
 *
 * Steps (on resetKey / commitKey change):
 * 1. Seed values from the loaded note or empty defaults.
 * 2. When calendarDate is set, prefill title via formatCalendarNoteTitle.
 * 3. Emit onChange with isDirty/isValid meta on every field update.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatCalendarNoteTitle } from "@/entities/note/editor/lib/format-calendar-note-title";
import { formatNoteLastEditedAt } from "@/entities/note/editor/lib/format-last-edited";
import { noteFormSchema } from "@/entities/note/editor/model/note-form.schema";
import type {
  NoteFormFieldErrors,
  NoteFormValues,
  UseNoteFormOptions,
  UseNoteFormResult,
} from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note";

const EMPTY_VALUES: NoteFormValues = {
  title: "",
  content: "",
  starred: false,
  isImportant: false,
};

function noteToFormValues(
  note: Note | null,
  calendarDate: string | null,
): NoteFormValues {
  if (calendarDate) {
    return {
      title: note?.title ?? formatCalendarNoteTitle(calendarDate),
      content: note?.content ?? "",
      starred: note?.starred ?? false,
      isImportant: note?.isImportant ?? false,
    };
  }

  if (!note) {
    return EMPTY_VALUES;
  }

  return {
    title: note.title,
    content: note.content,
    starred: note.starred,
    isImportant: note.isImportant,
  };
}

function valuesAreEqual(left: NoteFormValues, right: NoteFormValues): boolean {
  return (
    left.title === right.title &&
    left.content === right.content &&
    left.starred === right.starred &&
    left.isImportant === right.isImportant
  );
}

function getFieldErrors(values: NoteFormValues): NoteFormFieldErrors {
  const result = noteFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  const errors: NoteFormFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      (field === "title" ||
        field === "content" ||
        field === "starred" ||
        field === "isImportant")
    ) {
      errors[field] ??= issue.message;
    }
  }

  return errors;
}

/**
 * Manages controlled note editor state derived from an optional existing note.
 *
 * Resets fields only on `resetKey` / note id changes — not on optimistic cache
 * updates — so autosave does not wipe in-progress typing.
 */
export function useNoteForm({
  note,
  resetKey,
  commitKey = 0,
  calendarDate = null,
  onChange,
}: UseNoteFormOptions): UseNoteFormResult {
  const noteKey = note?.id ?? "draft";
  const initialValues = useMemo(
    () => noteToFormValues(note, calendarDate),
    [calendarDate, noteKey, resetKey],
  );

  const [baselineValues, setBaselineValues] =
    useState<NoteFormValues>(initialValues);
  const [values, setValues] = useState<NoteFormValues>(initialValues);
  const [errors, setErrors] = useState<NoteFormFieldErrors>({});

  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Context switch — reload fields from the resolved note or empty draft.
  useEffect(() => {
    const nextValues = noteToFormValues(note, calendarDate);
    setBaselineValues(nextValues);
    setValues(nextValues);
    setErrors({});
  }, [calendarDate, note, noteKey, resetKey]);

  // Successful autosave — snap baseline without overwriting current inputs.
  useEffect(() => {
    if (commitKey === 0) {
      return;
    }

    setBaselineValues(valuesRef.current);
  }, [commitKey]);

  const isDirty = useMemo(
    () => !valuesAreEqual(values, baselineValues),
    [baselineValues, values],
  );

  const isValid = useMemo(
    () => noteFormSchema.safeParse(values).success,
    [values],
  );

  const formattedLastEditedAt = useMemo(
    () => formatNoteLastEditedAt(note?.lastEditedAt),
    [note?.lastEditedAt],
  );

  const updateValues = useCallback((nextValues: NoteFormValues) => {
    setValues(nextValues);
    setErrors(getFieldErrors(nextValues));
  }, []);

  useEffect(() => {
    onChange?.(values, { isDirty, isValid });
  }, [isDirty, isValid, onChange, values]);

  const setTitle = useCallback(
    (title: string) => {
      updateValues({ ...values, title });
    },
    [updateValues, values],
  );

  const setContent = useCallback(
    (content: string) => {
      updateValues({ ...values, content });
    },
    [updateValues, values],
  );

  const toggleStarred = useCallback(() => {
    updateValues({ ...values, starred: !values.starred });
  }, [updateValues, values]);

  const toggleImportant = useCallback(() => {
    updateValues({ ...values, isImportant: !values.isImportant });
  }, [updateValues, values]);

  return {
    values,
    errors,
    isDirty,
    isValid,
    formattedLastEditedAt,
    setTitle,
    setContent,
    toggleStarred,
    toggleImportant,
  };
}
