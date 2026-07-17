/**
 * @file features/activity/activity-today-card/ui/today-card-note.tsx
 * Expandable note panel for the Home Today row: the day's record description.
 *
 * Uncontrolled placeholder until Milestone 2 wires the record write path.
 */

"use client";

import { memo } from "react";

export interface TodayCardNoteProps {
  /** Activity title, used to phrase the placeholder. */
  title: string;
  /** Existing record description, or `null` when none. */
  description: string | null;
}

/** Renders the description textarea shown when the row is expanded. */
export const TodayCardNote = memo(function TodayCardNote({
  title,
  description,
}: TodayCardNoteProps) {
  return (
    <div className="px-1 pb-2 pl-8">
      <textarea
        className="w-full resize-none border-[var(--color-border)] bg-transparent px-2 py-1 text-caption [color:var(--color-fg)] outline-none placeholder:[color:var(--color-fg-hint)] focus-visible:[border-color:color-mix(in_srgb,var(--color-accent)_60%,var(--color-border))]"
        defaultValue={description ?? ""}
        placeholder={`How did your ${title.toLowerCase()} go today? …`}
        rows={2}
      />
    </div>
  );
});
