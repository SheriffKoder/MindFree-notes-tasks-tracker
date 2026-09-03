/**
 * @file entities/note/category/editor/model/use-note-category-form.ts
 * Local field state, dirty tracking, and validation for the category editor.
 *
 * Purpose: Own form state only — no network I/O or save routing.
 * Used in: entities/note/category/editor/ui/note-category-form.tsx
 * Used for: Controlled name/showOnHome fields and dirty/valid meta.
 *
 * Steps (on resetKey change):
 * 1. Seed values from the loaded category or empty create defaults.
 * 2. Emit onChange with isDirty/isValid meta on every field update.
 * 3. Snap baseline on commitKey after a successful parent save.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { noteCategoryFormSchema } from "@/entities/note/category/editor/model/note-category-form.schema";
import type {
  NoteCategoryFormFieldErrors,
  NoteCategoryFormValues,
  UseNoteCategoryFormOptions,
  UseNoteCategoryFormResult,
} from "@/entities/note/category/editor/model/types";
import type { NoteCategory } from "@/entities/note/category/model/types";

const EMPTY_VALUES: NoteCategoryFormValues = {
  name: "",
  showOnHome: true,
};

/**
 * Maps a category row onto form fields; create uses empty defaults.
 */
function categoryToFormValues(
  category: NoteCategory | null,
): NoteCategoryFormValues {
  if (!category) {
    return EMPTY_VALUES;
  }

  return {
    name: category.name,
    showOnHome: category.showOnHome,
  };
}

function valuesAreEqual(
  left: NoteCategoryFormValues,
  right: NoteCategoryFormValues,
): boolean {
  return left.name === right.name && left.showOnHome === right.showOnHome;
}

function getFieldErrors(
  values: NoteCategoryFormValues,
): NoteCategoryFormFieldErrors {
  const result = noteCategoryFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  const errors: NoteCategoryFormFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && (field === "name" || field === "showOnHome")) {
      errors[field] ??= issue.message;
    }
  }

  return errors;
}

/**
 * Manages controlled category editor state derived from an optional category.
 *
 * Resets fields only on `resetKey` — not on optimistic cache updates — so
 * typing is not wiped while a parent mutation is in flight.
 */
export function useNoteCategoryForm({
  category,
  resetKey,
  commitKey = 0,
  onChange,
}: UseNoteCategoryFormOptions): UseNoteCategoryFormResult {
  const categoryRef = useRef(category);
  categoryRef.current = category;

  const [baselineValues, setBaselineValues] = useState<NoteCategoryFormValues>(
    () => categoryToFormValues(category),
  );
  const [values, setValues] = useState<NoteCategoryFormValues>(() =>
    categoryToFormValues(category),
  );
  const [errors, setErrors] = useState<NoteCategoryFormFieldErrors>({});

  const valuesRef = useRef(values);
  valuesRef.current = values;

  /////////////////////////////////////////////////////////////
  // Context switch — reload fields from the category or empty draft
  /////////////////////////////////////////////////////////////
  useEffect(
    function resetCategoryFormOnContextChange() {
      const nextValues = categoryToFormValues(categoryRef.current);
      setBaselineValues(nextValues);
      setValues(nextValues);
      setErrors({});
    },
    [resetKey],
  );

  /////////////////////////////////////////////////////////////
  // Successful save — snap baseline without overwriting current inputs
  /////////////////////////////////////////////////////////////
  useEffect(
    function snapCategoryFormBaselineOnCommit() {
      if (commitKey === 0) {
        return;
      }

      setBaselineValues(valuesRef.current);
    },
    [commitKey],
  );

  const isDirty = useMemo(
    () => !valuesAreEqual(values, baselineValues),
    [baselineValues, values],
  );

  const isValid = useMemo(
    () => noteCategoryFormSchema.safeParse(values).success,
    [values],
  );

  const updateValues = useCallback((nextValues: NoteCategoryFormValues) => {
    setValues(nextValues);
    setErrors(getFieldErrors(nextValues));
  }, []);

  useEffect(
    function emitCategoryFormChange() {
      onChange?.(values, { isDirty, isValid });
    },
    [isDirty, isValid, onChange, values],
  );

  const setName = useCallback(
    (name: string) => {
      updateValues({ ...values, name });
    },
    [updateValues, values],
  );

  const setShowOnHome = useCallback(
    (showOnHome: boolean) => {
      updateValues({ ...values, showOnHome });
    },
    [updateValues, values],
  );

  return {
    values,
    errors,
    isDirty,
    isValid,
    setName,
    setShowOnHome,
  };
}
