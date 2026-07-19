/**
 * @file entities/activity/editor/fields/activity-form-title-row.tsx
 * Title (h2) + dimmer description for the activity config form.
 */

import { ActivityFormTitleActions } from "@/entities/activity/editor/fields/activity-form-title-actions";
import {
  PLAIN_DESCRIPTION_CLASS,
  PLAIN_TITLE_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import type {
  ActivityFormFieldErrors,
  ActivityFormValues,
} from "@/entities/activity/editor/model/types";

export interface ActivityFormTitleRowProps {
  values: Pick<ActivityFormValues, "title" | "description">;
  errors: Pick<ActivityFormFieldErrors, "title" | "description">;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string | null) => void;
  /** When true, title actions show Restore instead of Archive. */
  isArchived?: boolean;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}

/**
 * Hero title input with a quieter description field beneath.
 */
export function ActivityFormTitleRow({
  values,
  errors,
  onTitleChange,
  onDescriptionChange,
  isArchived = false,
  onArchive,
  onRestore,
  onDelete,
}: ActivityFormTitleRowProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex flex-col gap-1">
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

          <ActivityFormTitleActions
            isArchived={isArchived}
            onArchive={onArchive}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        </div>
        {errors.title ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          aria-invalid={Boolean(errors.description)}
          className={PLAIN_DESCRIPTION_CLASS}
          name="description"
          placeholder="Description (optional)"
          rows={2}
          value={values.description ?? ""}
          onChange={(event) => {
            const next = event.target.value;
            onDescriptionChange(next.trim() === "" ? null : next);
          }}
        />
        {errors.description ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {errors.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
