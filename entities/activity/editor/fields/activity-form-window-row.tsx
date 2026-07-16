/**
 * @file entities/activity/editor/fields/activity-form-window-row.tsx
 * Validity window (`startsAt` / `endsAt`) with calendar dropdowns.
 */

"use client";

import { CalendarDropdown } from "@/components/calendar";
import { Label } from "@/components/ui/label";
import { getTodayIsoDate } from "@/shared/calendar";

export interface ActivityFormWindowRowProps {
  startsAt: string | null | undefined;
  endsAt: string | null | undefined;
  startsAtError?: string;
  endsAtError?: string;
  onStartsAtChange: (startsAt: string | null) => void;
  onEndsAtChange: (endsAt: string | null) => void;
}

function WindowDateField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string | null | undefined;
  error?: string;
  onChange: (next: string | null) => void;
}) {
  const display = value ?? "Open";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <p
          className="min-w-0 flex-1 text-sm tabular-nums [color:var(--color-fg)]"
          id={id}
        >
          {display}
        </p>
        <CalendarDropdown
          selectedDate={value ?? getTodayIsoDate()}
          triggerLabel={`Pick ${label.toLowerCase()}`}
          onDateChange={onChange}
        />
        {value ? (
          <button
            className="text-caption [color:var(--color-fg-muted)] underline-offset-2 hover:underline"
            type="button"
            onClick={() => onChange(null)}
          >
            Clear
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Optional start/end ISO dates defining when the activity is in force.
 */
export function ActivityFormWindowRow({
  startsAt,
  endsAt,
  startsAtError,
  endsAtError,
  onStartsAtChange,
  onEndsAtChange,
}: ActivityFormWindowRowProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <WindowDateField
        error={startsAtError}
        id="activity-starts-at"
        label="Starts"
        value={startsAt}
        onChange={onStartsAtChange}
      />
      <WindowDateField
        error={endsAtError}
        id="activity-ends-at"
        label="Ends"
        value={endsAt}
        onChange={onEndsAtChange}
      />
    </div>
  );
}
