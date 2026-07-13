/**
 * @file components/calendar/calendar-dropdown.tsx
 * Calendar icon trigger that opens a dropdown date picker.
 *
 * Purpose: Touch-friendly date selection that works inside drawers and on mobile.
 * Used in: entities/note/editor/ui/note-date-picker-trigger.tsx
 */

"use client";

import { Calendar } from "lucide-react";
import { useCallback, useState } from "react";

import DateSelectorSimple from "@/components/calendar/calendar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTodayIsoDate } from "@/shared/calendar";

export interface CalendarDropdownProps {
  /** Currently selected `YYYY-MM-DD`; defaults to today when opening. */
  selectedDate?: string;
  /** Called with `YYYY-MM-DD` when the user confirms a new date. */
  onDateChange: (isoDate: string) => void;
  /** Optional guard — skip `onDateChange` when this returns true. */
  shouldIgnorePick?: (isoDate: string) => boolean;
  /** Accessible label for the trigger button. */
  triggerLabel?: string;
}

/**
 * Dropdown calendar picker — portals above drawer chrome (`z-[70]`).
 */
export function CalendarDropdown({
  selectedDate,
  onDateChange,
  shouldIgnorePick,
  triggerLabel = "Pick calendar date",
}: CalendarDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleDateChange = useCallback(
    (startDate: string) => {
      if (!startDate || shouldIgnorePick?.(startDate)) {
        return;
      }

      onDateChange(startDate);
      setOpen(false);
    },
    [onDateChange, shouldIgnorePick],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={triggerLabel}
          className="shrink-0"
          size="icon"
          title={triggerLabel}
          type="button"
          variant="ghost"
        >
          <Calendar className="h-4 w-4 [color:var(--note-form-star-inactive)]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="z-[70] w-auto min-w-0 border-[var(--color-border)] p-0"
        side="bottom"
        sideOffset={6}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DateSelectorSimple
          selectedEndDate={selectedDate ?? getTodayIsoDate()}
          selectedStartDate={selectedDate ?? getTodayIsoDate()}
          onDateChange={handleDateChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
