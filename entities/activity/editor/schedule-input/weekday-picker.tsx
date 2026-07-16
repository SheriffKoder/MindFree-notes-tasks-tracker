/**
 * @file entities/activity/editor/schedule-input/weekday-picker.tsx
 * Multi-select weekday chips for `weekly` scheduleConfig.
 */

"use client";

import { WEEKDAYS } from "@/entities/activity/model/types";
import type { Weekday } from "@/entities/activity/model/types";
import {
  CHIP_ACTIVE_CLASS,
  CHIP_CLASS,
  CHIP_INACTIVE_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { WEEKDAY_LABELS } from "@/entities/activity/editor/lib/form-labels";
import { toggleChipValue } from "@/entities/activity/editor/lib/toggle-chip-value";
import { cn } from "@/lib/utils";

export interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
}

/**
 * Toggle weekdays; refuses to clear the last selected day.
 */
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  return (
    <div
      aria-label="Weekdays"
      className="flex flex-wrap gap-1.5"
      role="group"
    >
      {WEEKDAYS.map((day) => {
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
            onClick={() =>
              onChange(toggleChipValue(value, day) as Weekday[])
            }
          >
            {WEEKDAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}
