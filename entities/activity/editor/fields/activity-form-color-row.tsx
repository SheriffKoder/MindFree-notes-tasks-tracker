/**
 * @file entities/activity/editor/fields/activity-form-color-row.tsx
 * Color field row — wraps shared ColorPicker beside its label.
 */

"use client";

import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { ColorPicker } from "@/shared/color-picker";

export interface ActivityFormColorRowProps {
  color: string | null | undefined;
  error?: string;
  onChange: (color: string | null) => void;
}

/**
 * Activity color setting: presets + free-text CSS color, commit-on-valid.
 */
export function ActivityFormColorRow({
  color,
  error,
  onChange,
}: ActivityFormColorRowProps) {
  return (
    <ActivityFormFieldRow error={error} label="Color">
      <ColorPicker
        contentClassName={FIELD_MENU_CONTENT_CLASS}
        triggerClassName={FIELD_MENU_TRIGGER_CLASS}
        value={color ?? null}
        onChange={onChange}
      />
    </ActivityFormFieldRow>
  );
}
