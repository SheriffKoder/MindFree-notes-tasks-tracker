/**
 * @file entities/note/editor/ui/note-date-picker-trigger.tsx
 * Calendar icon that opens a native date picker — dumb UI, no save logic.
 *
 * Purpose: Capture one ISO date pick and forward it to the drawer orchestrator.
 * Used in: entities/note/editor/ui/note-form-toggle-buttons.tsx
 * Used for: Step 11 date pick — default today, one-shot change listener, onPick(iso).
 *
 * Steps (handlePick):
 * 1. Open hidden native input[type=date] (defaults to today).
 * 2. Listen once for change, then detach to avoid duplicate picks.
 * 3. Call onPick with the selected ISO date; parent sets title locally.
 */

"use client";

import { Calendar } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { isDateFormattedTitle } from "@/entities/note/editor/lib/format-calendar-note-title";
import { getTodayIsoDate } from "@/shared/calendar";

export interface NoteDatePickerTriggerProps {
  /** Current title — ignores pick when it already matches the formatted date label. */
  currentTitle: string;
  /** Called with `YYYY-MM-DD` when the user confirms a new date. */
  onPick: (isoDate: string) => void;
}

/**
 * Opens a native date picker defaulting to today. Uses a one-shot `change` listener
 * so programmatic value setup does not fire `onPick` before the user confirms.
 */
export function NoteDatePickerTrigger({
  currentTitle,
  onPick,
}: NoteDatePickerTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const openPicker = useCallback(() => {
    setSessionKey((previous) => previous + 1);

    queueMicrotask(() => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      const handleCommit = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (!value || isDateFormattedTitle(currentTitle, value)) {
          return;
        }

        onPick(value);
      };

      input.addEventListener("change", handleCommit, { once: true });
      input.value = getTodayIsoDate();

      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }

      input.click();
    });
  }, [currentTitle, onPick]);

  return (
    <>
      <Button
        aria-label="Pick calendar date"
        className="shrink-0"
        size="icon"
        title="Pick calendar date"
        type="button"
        variant="ghost"
        onClick={openPicker}
      >
        <Calendar className="h-4 w-4 [color:var(--note-form-star-inactive)]" />
      </Button>

      <input
        key={sessionKey}
        ref={inputRef}
        aria-hidden
        className="sr-only"
        tabIndex={-1}
        type="date"
      />
    </>
  );
}
