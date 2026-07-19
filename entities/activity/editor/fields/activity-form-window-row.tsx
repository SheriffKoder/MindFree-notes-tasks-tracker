/**
 * @file entities/activity/editor/fields/activity-form-window-row.tsx
 * Starts / ends date fields — label left, calendar menu right.
 */

"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

import DateSelectorSimple from "@/components/calendar/calendar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { cn } from "@/lib/utils";
import { getTodayIsoDate } from "@/shared/calendar";

export interface ActivityFormWindowRowProps {
  startsAt: string | null | undefined;
  endsAt: string | null | undefined;
  startsAtError?: string;
  endsAtError?: string;
  onStartsAtChange: (startsAt: string | null) => void;
  onEndsAtChange: (endsAt: string | null) => void;
}

function WindowDateMenu({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  error?: string;
  onChange: (next: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const display = value ?? "Open";

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
    <ActivityFormFieldRow error={error} label={label}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Pick ${label.toLowerCase()} date`}
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Calendar
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 opacity-60"
            />
            <span className="truncate tabular-nums">{display}</span>
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
            selectedEndDate={value ?? getTodayIsoDate()}
            selectedStartDate={value ?? getTodayIsoDate()}
            onDateChange={handleDateChange}
          />
          {value ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center text-caption"
                onSelect={() => onChange(null)}
              >
                Clear
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
      <WindowDateMenu
        error={startsAtError}
        label="Starts"
        value={startsAt}
        onChange={onStartsAtChange}
      />
      <WindowDateMenu
        error={endsAtError}
        label="Ends"
        value={endsAt}
        onChange={onEndsAtChange}
      />
    </div>
  );
}
