/**
 * @file entities/activity/editor/schedule-input/weekday-picker.tsx
 * Multi-select weekdays inside a DropdownMenu.
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
import { WEEKDAY_LABELS } from "@/entities/activity/editor/lib/form-labels";
import { toggleChipValue } from "@/entities/activity/editor/lib/toggle-chip-value";
import { WEEKDAYS } from "@/entities/activity/model/types";
import type { Weekday } from "@/entities/activity/model/types";
import { cn } from "@/lib/utils";

export interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
  error?: string;
}

/**
 * Toggle weekdays in a menu; refuses to clear the last selected day.
 */
export function WeekdayPicker({ value, onChange, error }: WeekdayPickerProps) {
  const summary = formatScheduleSummary("weekly", value);

  return (
    <ActivityFormFieldRow error={error} label="On">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Weekdays"
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
          className={cn(FIELD_MENU_CONTENT_CLASS, "min-w-[10rem]")}
        >
          {WEEKDAYS.map((day) => {
            const isActive = value.includes(day);

            return (
              <DropdownMenuCheckboxItem
                key={day}
                checked={isActive}
                onCheckedChange={() =>
                  onChange(toggleChipValue(value, day) as Weekday[])
                }
                onSelect={(event) => event.preventDefault()}
              >
                {WEEKDAY_LABELS[day]}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
  );
}
