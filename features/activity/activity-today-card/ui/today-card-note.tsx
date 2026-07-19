/**
 * @file features/activity/activity-today-card/ui/today-card-note.tsx
 * Expandable note panel for a day activity row: the day's record description.
 *
 * Controlled when `onChange` is provided (quick-record persist). Falls back to
 * an uncontrolled display when used without a write path.
 */

"use client";

import { memo, type ChangeEvent } from "react";

export interface TodayCardNoteProps {
  /** Activity title, used to phrase the placeholder. */
  title: string;
  /** Existing record description, or `null` when none. */
  description: string | null;
  /** Persists description edits; omit for a read-only/unwired textarea. */
  onChange?: (value: string | null) => void;
}

/** Renders the description textarea shown when the row is expanded. */
export const TodayCardNote = memo(function TodayCardNote({
  title,
  description,
  onChange,
}: TodayCardNoteProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.target.value === "" ? null : event.target.value);
  };

  return (
    <div className="px-1 pb-2 pl-8">
      <textarea
        className="w-full resize-none border-[var(--color-border)] bg-transparent px-2 py-1 text-caption [color:var(--color-fg)] outline-none placeholder:[color:var(--color-fg-hint)] focus-visible:[border-color:color-mix(in_srgb,var(--color-accent)_60%,var(--color-border))]"
        placeholder={`How did your ${title.toLowerCase()} go today? …`}
        rows={2}
        {...(onChange
          ? { value: description ?? "", onChange: handleChange }
          : { defaultValue: description ?? "" })}
      />
    </div>
  );
});
