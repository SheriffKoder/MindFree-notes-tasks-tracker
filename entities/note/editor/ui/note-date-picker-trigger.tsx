/**
 * @file entities/note/editor/ui/note-date-picker-trigger.tsx
 * Calendar icon that opens a dropdown date picker — dumb UI, no save logic.
 *
 * Purpose: Capture one ISO date pick and forward it to the drawer orchestrator.
 * Used in: entities/note/editor/ui/note-form-toggle-buttons.tsx
 * Used for: Step 11 date pick — dropdown calendar, onPick(iso).
 */

"use client";

import { useCallback } from "react";

import { CalendarDropdown } from "@/components/calendar";
import { isDateFormattedTitle } from "@/entities/note/editor/lib/format-calendar-note-title";
import { getTodayIsoDate } from "@/shared/calendar";

export interface NoteDatePickerTriggerProps {
  /** Current title — ignores pick when it already matches the formatted date label. */
  currentTitle: string;
  /** Bound calendar date when known (`YYYY-MM-DD`). */
  selectedDate?: string | null;
  /** Called with `YYYY-MM-DD` when the user confirms a new date. */
  onPick: (isoDate: string) => void;
}

/**
 * Opens a dropdown calendar defaulting to the bound date or today.
 */
export function NoteDatePickerTrigger({
  currentTitle,
  selectedDate,
  onPick,
}: NoteDatePickerTriggerProps) {
  const shouldIgnorePick = useCallback(
    (isoDate: string) => isDateFormattedTitle(currentTitle, isoDate),
    [currentTitle],
  );

  return (
    <CalendarDropdown
      selectedDate={selectedDate ?? getTodayIsoDate()}
      shouldIgnorePick={shouldIgnorePick}
      onDateChange={onPick}
    />
  );
}
