/**
 * @file entities/activity/editor/schedule-input/once-date-input.tsx
 * Once-schedule date picker — DropdownMenu with calendar content.
 */

"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

import DateSelectorSimple from "@/components/calendar/calendar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { cn } from "@/lib/utils";
import { getTodayIsoDate } from "@/shared/calendar";

export interface OnceDateInputProps {
  /** Selected day as `YYYY-MM-DD`. */
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
}

/**
 * Label + date menu for a one-shot schedule.
 */
export function OnceDateInput({ value, onChange, error }: OnceDateInputProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value || getTodayIsoDate();

  const handleDateChange = useCallback(
    (isoDate: string) => {
      if (!isoDate) {
        return;
      }

      onChange(isoDate);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <ActivityFormFieldRow error={error} label="On">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Pick schedule date"
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Calendar
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 opacity-60"
            />
            <span className="truncate tabular-nums">{selectedDate}</span>
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            FIELD_MENU_CONTENT_CLASS,
            "w-auto min-w-0 border-[var(--color-border)] p-0",
          )}
          side="bottom"
          sideOffset={6}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DateSelectorSimple
            selectedEndDate={selectedDate}
            selectedStartDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
  );
}
