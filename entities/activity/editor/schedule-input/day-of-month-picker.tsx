/**
 * @file entities/activity/editor/schedule-input/day-of-month-picker.tsx
 * Multi-select day-of-month chips for `monthly` scheduleConfig (`"01"`…`"31"`).
 */

"use client";

import {
  CHIP_ACTIVE_CLASS,
  CHIP_CLASS,
  CHIP_INACTIVE_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { toggleChipValue } from "@/entities/activity/editor/lib/toggle-chip-value";
import { cn } from "@/lib/utils";

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export interface DayOfMonthPickerProps {
  /** Zero-padded day strings (`"01"` … `"31"`). */
  value: string[];
  onChange: (days: string[]) => void;
}

/**
 * Toggle days of the month; refuses to clear the last selected day.
 */
export function DayOfMonthPicker({ value, onChange }: DayOfMonthPickerProps) {
  return (
    <div
      aria-label="Days of month"
      className="flex flex-wrap gap-1.5"
      role="group"
    >
      {DAYS_OF_MONTH.map((day) => {
        const isActive = value.includes(day);

        return (
          <button
            key={day}
            aria-pressed={isActive}
            className={cn(
              CHIP_CLASS,
              isActive ? CHIP_ACTIVE_CLASS : CHIP_INACTIVE_CLASS,
            )}
            type="button"
            onClick={() => onChange(toggleChipValue(value, day))}
          >
            {Number(day)}
          </button>
        );
      })}
    </div>
  );
}
