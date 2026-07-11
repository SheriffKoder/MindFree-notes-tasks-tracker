/**
 * @file features/notes/note-drawer/ui/note-drawer-footer.tsx
 * Thin drawer footer — day arrows on the left, last-edited on the right.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoteFormLastSaved } from "@/entities/note/editor/ui/note-form-last-saved";
import type { NoteSaveStatus } from "@/entities/note/editor/model/types";
import { shiftIsoDate } from "@/features/notes/note-drawer/lib/shift-iso-date";
import { formatDayAriaLabel } from "@/shared/calendar";

export interface NoteDrawerFooterProps {
  /** Active drawer ISO date (`YYYY-MM-DD`) when date navigation is enabled. */
  activeDate: string | null;
  isDateNavEnabled: boolean;
  formattedLastEditedAt: string | null;
  saveStatus?: NoteSaveStatus;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Compact footer row anchored below the scrollable editor content.
 */
export function NoteDrawerFooter({
  activeDate,
  isDateNavEnabled,
  formattedLastEditedAt,
  saveStatus = "idle",
  onPrevious,
  onNext,
}: NoteDrawerFooterProps) {
  const previousDateLabel =
    activeDate && isDateNavEnabled
      ? formatDayAriaLabel(shiftIsoDate(activeDate, -1))
      : null;
  const nextDateLabel =
    activeDate && isDateNavEnabled
      ? formatDayAriaLabel(shiftIsoDate(activeDate, 1))
      : null;

  return (
    <footer className="flex shrink-0 items-center justify-between gap-2 py-1">
      <div className="flex min-w-0 items-center">
        {isDateNavEnabled && activeDate ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              aria-label={
                previousDateLabel
                  ? `Go to ${previousDateLabel}`
                  : "Go to previous day"
              }
              className="h-7 w-7"
              size="icon"
              title={previousDateLabel ?? undefined}
              type="button"
              variant="ghost"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <Button
              aria-label={
                nextDateLabel ? `Go to ${nextDateLabel}` : "Go to next day"
              }
              className="h-7 w-7"
              size="icon"
              title={nextDateLabel ?? undefined}
              type="button"
              variant="ghost"
              onClick={onNext}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null}
      </div>

      <NoteFormLastSaved
        formattedLastEditedAt={formattedLastEditedAt}
        saveStatus={saveStatus}
        variant="inline"
      />
    </footer>
  );
}
