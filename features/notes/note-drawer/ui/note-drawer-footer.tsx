/**
 * @file features/notes/note-drawer/ui/note-drawer-footer.tsx
 * Thin drawer footer — day arrows, conflict prompt, last-edited status.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NoteFormLastSaved } from "@/entities/note/editor/ui/note-form-last-saved";
import type { NoteSaveStatus } from "@/entities/note/editor/model/types";
import { shiftIsoDate } from "@/features/notes/note-drawer/lib/shift-iso-date";
import { formatDayAriaLabel } from "@/shared/calendar";

export interface NoteDrawerFooterConflict {
  date: string;
  existingNoteId: string;
}

export interface NoteDrawerFooterProps {
  /** Active drawer ISO date (`YYYY-MM-DD`) when date navigation is enabled. */
  activeDate: string | null;
  isDateNavEnabled: boolean;
  formattedLastEditedAt: string | null;
  saveStatus?: NoteSaveStatus;
  /** Same-day conflict — blocks autosave until the user replaces or changes date. */
  conflict?: NoteDrawerFooterConflict | null;
  onPrevious: () => void;
  onNext: () => void;
  /** Hard-delete the other note on the day, then save the current note. */
  onResolveReplace?: () => void;
  /** Dismiss the prompt; user can change date or title before saving. */
  onResolveDismiss?: () => void;
}

/**
 * Compact footer row anchored below the scrollable editor content.
 */
export function NoteDrawerFooter({
  activeDate,
  isDateNavEnabled,
  formattedLastEditedAt,
  saveStatus = "idle",
  conflict = null,
  onPrevious,
  onNext,
  onResolveReplace,
  onResolveDismiss,
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
    <footer className="flex shrink-0 flex-col gap-1.5 py-1">
      {conflict ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border)] px-2 py-1.5 [background-color:color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
          role="status"
        >
          <p className="min-w-0 text-caption [color:var(--color-fg-muted)]">
            A note exists on {formatDayAriaLabel(conflict.date)}. Replace?
          </p>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              className="h-7 border-transparent px-2.5 text-caption [background-color:var(--color-accent)] [color:var(--color-accent-fg)] hover:brightness-95"
              size="sm"
              type="button"
              onClick={onResolveReplace}
            >
              Yes
            </Button>

            <Button
              className="h-7 border-[var(--color-border)] px-2.5 text-caption [background-color:var(--color-card-overlay)] [color:var(--color-fg-muted)] hover:[background-color:var(--color-card-hover)] hover:[color:var(--color-fg)]"
              size="sm"
              type="button"
              variant="outline"
              onClick={onResolveDismiss}
            >
              No
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
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
      </div>
    </footer>
  );
}
