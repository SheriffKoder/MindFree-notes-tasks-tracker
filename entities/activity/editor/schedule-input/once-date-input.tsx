/**
 * @file entities/activity/editor/schedule-input/once-date-input.tsx
 * Once-schedule date picker — wraps CalendarDropdown.
 */

"use client";

import { CalendarDropdown } from "@/components/calendar";
import { getTodayIsoDate } from "@/shared/calendar";

export interface OnceDateInputProps {
  /** Selected day as `YYYY-MM-DD`. */
  value: string;
  onChange: (isoDate: string) => void;
}

/**
 * Shows the bound ISO date beside a portal-safe calendar dropdown.
 */
export function OnceDateInput({ value, onChange }: OnceDateInputProps) {
  const selectedDate = value || getTodayIsoDate();

  return (
    <div className="flex items-center gap-2">
      <p className="min-w-0 flex-1 text-sm tabular-nums [color:var(--color-fg)]">
        {selectedDate}
      </p>
      <CalendarDropdown
        selectedDate={selectedDate}
        triggerLabel="Pick schedule date"
        onDateChange={onChange}
      />
    </div>
  );
}
