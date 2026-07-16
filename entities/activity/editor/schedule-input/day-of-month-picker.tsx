/**
 * @file entities/activity/editor/schedule-input/day-of-month-picker.tsx
 * Multi-select day-of-month options inside a DropdownMenu.
 */

"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { formatScheduleSummary } from "@/entities/activity/editor/lib/format-schedule-summary";
import { toggleChipValue } from "@/entities/activity/editor/lib/toggle-chip-value";
import { cn } from "@/lib/utils";

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export interface DayOfMonthPickerProps {
  /** Zero-padded day strings (`"01"` … `"31"`). */
  value: string[];
  onChange: (days: string[]) => void;
  error?: string;
}

/**
 * Toggle days of the month in a menu; refuses to clear the last selected day.
 */
export function DayOfMonthPicker({
  value,
  onChange,
  error,
}: DayOfMonthPickerProps) {
  const summary = formatScheduleSummary("monthly", value);

  return (
    <ActivityFormFieldRow error={error} label="On">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Days of month"
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            <span className="truncate">{summary}</span>
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            FIELD_MENU_CONTENT_CLASS,
            "max-h-64 min-w-[8rem] overflow-y-auto",
          )}
        >
          {DAYS_OF_MONTH.map((day) => {
            const isActive = value.includes(day);

            return (
              <DropdownMenuCheckboxItem
                key={day}
                checked={isActive}
                onCheckedChange={() => onChange(toggleChipValue(value, day))}
                onSelect={(event) => event.preventDefault()}
              >
                {Number(day)}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
  );
}
