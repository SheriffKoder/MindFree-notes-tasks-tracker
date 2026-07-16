/**
 * @file entities/activity/editor/schedule-input/day-month-picker.tsx
 * Multi-select `DD/MM` yearly dates inside a DropdownMenu.
 */

"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
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
import { Incrementer } from "@/shared/incrementer";

export interface DayMonthPickerProps {
  /** Zero-padded `DD/MM` strings. */
  value: string[];
  onChange: (dayMonths: string[]) => void;
  error?: string;
}

function toDayMonth(day: number, month: number): string {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
}

/**
 * Lists selected yearly dates as checkboxes; add via column day/month steppers.
 * Refuses to clear the last selected date.
 */
export function DayMonthPicker({ value, onChange, error }: DayMonthPickerProps) {
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);

  const candidate = toDayMonth(day, month);
  const alreadyAdded = value.includes(candidate);
  const canAdd = !alreadyAdded;
  const summary = formatScheduleSummary("yearly", value);

  const handleAdd = () => {
    if (alreadyAdded) {
      return;
    }

    onChange([...value, candidate]);
  };

  return (
    <ActivityFormFieldRow error={error} label="On">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Yearly dates"
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
          className={cn(FIELD_MENU_CONTENT_CLASS, "min-w-[14rem]")}
        >
          {value.map((entry) => (
            <DropdownMenuCheckboxItem
              key={entry}
              checked
              onCheckedChange={() => onChange(toggleChipValue(value, entry))}
              onSelect={(event) => event.preventDefault()}
            >
              {entry}
            </DropdownMenuCheckboxItem>
          ))}

          {value.length > 0 ? <DropdownMenuSeparator /> : null}

          <div className="flex flex-col gap-2 px-2 py-2">
            <div className="flex items-center justify-center gap-3">
              <Incrementer
                aria-label="Day"
                max={31}
                min={1}
                orientation="column"
                value={day}
                onChange={(next) => {
                  if (next !== null) {
                    setDay(next);
                  }
                }}
              />
              <span className="text-caption [color:var(--color-fg-muted)]">/</span>
              <Incrementer
                aria-label="Month"
                max={12}
                min={1}
                orientation="column"
                value={month}
                onChange={(next) => {
                  if (next !== null) {
                    setMonth(next);
                  }
                }}
              />
              <Button
                disabled={!canAdd}
                size="sm"
                type="button"
                variant="outline"
                onClick={handleAdd}
              >
                Add
              </Button>
            </div>
            {alreadyAdded ? (
              <p
                className="text-center text-caption [color:var(--color-fg-muted)]"
                role="status"
              >
                Already added
              </p>
            ) : null}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
  );
}
