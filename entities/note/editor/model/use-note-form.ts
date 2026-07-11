/**
 * @file entities/note/editor/model/use-note-form.ts
 * Local field state, dirty tracking, and validation for the note editor.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

function noteToFormValues(note: Note | null): NoteFormValues {
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
 */
export function useNoteForm({
  note,
  onChange,
}: UseNoteFormOptions): UseNoteFormResult {
  const baselineValues = useMemo(() => noteToFormValues(note), [note]);
  const noteKey = note?.id ?? "draft";

  const [values, setValues] = useState<NoteFormValues>(baselineValues);
  const [errors, setErrors] = useState<NoteFormFieldErrors>({});

  useEffect(() => {
    setValues(baselineValues);
    setErrors({});
  }, [baselineValues, noteKey]);

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
