/**
 * @file entities/activity/editor/schedule-input/day-month-picker.tsx
 * Multi-select `DD/MM` chips for `yearly` scheduleConfig.
 */

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CHIP_ACTIVE_CLASS,
  CHIP_CLASS,
  FIELD_SELECT_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { MONTH_LABELS } from "@/entities/activity/editor/lib/form-labels";
import { toggleChipValue } from "@/entities/activity/editor/lib/toggle-chip-value";
import { cn } from "@/lib/utils";

const DAYS = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export interface DayMonthPickerProps {
  /** Zero-padded `DD/MM` strings. */
  value: string[];
  onChange: (dayMonths: string[]) => void;
}

/**
 * Lists selected yearly dates as chips; add via day + month selects.
 * Refuses to clear the last selected date.
 */
export function DayMonthPicker({ value, onChange }: DayMonthPickerProps) {
  const [day, setDay] = useState("01");
  const [month, setMonth] = useState("01");

  const candidate = `${day}/${month}`;
  const canAdd = !value.includes(candidate);

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 ? (
        <div
          aria-label="Yearly dates"
          className="flex flex-wrap gap-1.5"
          role="group"
        >
          {value.map((entry) => (
            <button
              key={entry}
              aria-pressed
              className={cn(CHIP_CLASS, CHIP_ACTIVE_CLASS)}
              type="button"
              onClick={() => onChange(toggleChipValue(value, entry))}
            >
              {entry}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Day"
          className={cn(FIELD_SELECT_CLASS, "w-auto min-w-[4.5rem]")}
          value={day}
          onChange={(event) => setDay(event.target.value)}
        >
          {DAYS.map((entry) => (
            <option key={entry} value={entry}>
              {Number(entry)}
            </option>
          ))}
        </select>

        <select
          aria-label="Month"
          className={cn(FIELD_SELECT_CLASS, "w-auto min-w-[5.5rem]")}
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        >
          {MONTH_LABELS.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>

        <Button
          disabled={!canAdd}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => onChange([...value, candidate])}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
