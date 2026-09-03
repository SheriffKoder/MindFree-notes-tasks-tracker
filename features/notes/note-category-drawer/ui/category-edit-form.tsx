/**
 * @file features/notes/note-category-drawer/ui/category-edit-form.tsx
 * Create/edit wrapper around the entity category form.
 *
 * Purpose: Wire Save to create/update mutations; keep the entity form dumb.
 * Used in: features/notes/note-category-drawer/ui/note-category-drawer.tsx
 * Used for: Add category and rename / showOnHome edits.
 *
 * Steps:
 * 1. Track latest form values via onChange
 * 2. POST create or PATCH update on Save
 * 3. Map API errors to the parent banner
 */

"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { NoteCategory } from "@/entities/note/client";
import {
  useCreateNoteCategoryMutation,
  useUpdateNoteCategoryMutation,
} from "@/entities/note/client";
import {
  NoteCategoryForm,
  type NoteCategoryFormChangeMeta,
  type NoteCategoryFormValues,
} from "@/entities/note/category/editor";
import { mapCategoryApiError } from "@/features/notes/note-category-drawer/lib/map-category-api-error";

export interface CategoryEditFormProps {
  /** `null` for create; otherwise the category being edited. */
  category: NoteCategory | null;
  onCancel: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
}

/**
 * Renders the entity form plus Cancel / Save actions.
 */
export function CategoryEditForm({
  category,
  onCancel,
  onSaved,
  onError,
}: CategoryEditFormProps) {
  const createMutation = useCreateNoteCategoryMutation();
  const updateMutation = useUpdateNoteCategoryMutation();
  const [commitKey, setCommitKey] = useState(0);
  const [meta, setMeta] = useState<NoteCategoryFormChangeMeta>({
    isDirty: false,
    isValid: false,
  });
  const valuesRef = useRef<NoteCategoryFormValues>({
    name: category?.name ?? "",
    showOnHome: category?.showOnHome ?? true,
  });

  const isCreate = category == null;
  const resetKey = isCreate ? "new" : category.id;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleChange = useCallback(
    (values: NoteCategoryFormValues, nextMeta: NoteCategoryFormChangeMeta) => {
      valuesRef.current = values;
      setMeta(nextMeta);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!meta.isValid) {
      return;
    }

    const values = valuesRef.current;

    try {
      if (isCreate) {
        await createMutation.mutateAsync({
          name: values.name,
          showOnHome: values.showOnHome,
        });
      } else {
        await updateMutation.mutateAsync({
          id: category.id,
          body: {
            name: values.name,
            showOnHome: values.showOnHome,
          },
        });
        setCommitKey((current) => current + 1);
      }

      onSaved();
    } catch (error) {
      onError(mapCategoryApiError(error));
    }
  }, [
    category,
    createMutation,
    isCreate,
    meta.isValid,
    onError,
    onSaved,
    updateMutation,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <NoteCategoryForm
        category={category}
        commitKey={commitKey}
        resetKey={resetKey}
        onChange={handleChange}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={!meta.isValid || isPending || (!isCreate && !meta.isDirty)}
          size="sm"
          type="button"
          onClick={() => {
            void handleSave();
          }}
        >
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
