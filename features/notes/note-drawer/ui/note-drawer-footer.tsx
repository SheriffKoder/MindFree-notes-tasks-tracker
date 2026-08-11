/**
 * @file features/notes/note-drawer/ui/note-drawer-footer.tsx
 * Thin drawer footer — day arrows, conflict prompt, remote-update banner, last-edited status.
 *
 * Purpose: Present drawer chrome actions without owning save/sync policy.
 * Used in: features/notes/note-drawer/ui/note-drawer.tsx
 * Used for: Date nav, same-day conflict Replace, dirty remote Reload/Keep, save label.
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
  /** Optional override for the footer save label (errors, offline, stale reload). */
  saveFeedback?: string | null;
  /** Same-day conflict — blocks autosave until the user replaces or changes date. */
  conflict?: NoteDrawerFooterConflict | null;
  /**
   * Dirty form with a newer remote revision — never overwrites typing;
   * Reload / Keep editing only.
   */
  showRemoteUpdateBanner?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  /** Hard-delete the other note on the day, then save the current note. */
  onResolveReplace?: () => void;
  /** Dismiss the prompt; user can change date or title before saving. */
  onResolveDismiss?: () => void;
  /** Discard local fields and load the remote note from cache. */
  onReloadRemote?: () => void;
  /** Hide the remote banner; keep editing local fields. */
  onDismissRemoteBanner?: () => void;
}

/**
 * Compact footer row anchored to the bottom of the drawer shell.
 */
export function NoteDrawerFooter({
  activeDate,
  isDateNavEnabled,
  formattedLastEditedAt,
  saveStatus = "idle",
  saveFeedback = null,
  conflict = null,
  showRemoteUpdateBanner = false,
  onPrevious,
  onNext,
  onResolveReplace,
  onResolveDismiss,
  onReloadRemote,
  onDismissRemoteBanner,
}: NoteDrawerFooterProps) {
  const previousDateLabel =
    activeDate && isDateNavEnabled
      ? formatDayAriaLabel(shiftIsoDate(activeDate, -1))
      : null;
  const nextDateLabel =
    activeDate && isDateNavEnabled
      ? formatDayAriaLabel(shiftIsoDate(activeDate, 1))
      : null;

  const showConflictBanner = Boolean(conflict);
  const showRemoteBanner = showRemoteUpdateBanner && !showConflictBanner;

  return (
    <footer className="absolute bottom-0 right-0 md:right-3 w-full md:w-[50%] z-10 flex min-h-[2rem] flex-col justify-center gap-1.5 px-3 shadow-[0_-1px_0_0_rgba(255,255,255,0.02)] pointer-events-none">
      <div
        className={
          showConflictBanner || showRemoteBanner
            ? "flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border)] px-2 py-1.5 [background-color:color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
            : ""
        }
        role={showConflictBanner || showRemoteBanner ? "status" : undefined}
        aria-hidden={showConflictBanner || showRemoteBanner ? undefined : "true"}
      >
        {showConflictBanner && conflict ? (
          <>
            <p className="min-w-0 text-caption [color:var(--color-fg-muted)]">
              A note exists on {formatDayAriaLabel(conflict.date)}. Replace?
            </p>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                className="h-7 border-transparent px-2.5 text-caption [background-color:var(--color-accent)] [color:var(--color-accent-fg)] hover:brightness-95 pointer-events-auto"
                size="sm"
                type="button"
                onClick={onResolveReplace}
              >
                Yes
              </Button>

              <Button
                className="h-7 border-[var(--color-border)] px-2.5 text-caption [background-color:var(--color-card-overlay)] [color:var(--color-fg-muted)] hover:[background-color:var(--color-card-hover)] hover:[color:var(--color-fg)] pointer-events-auto"
                size="sm"
                type="button"
                variant="outline"
                onClick={onResolveDismiss}
              >
                No
              </Button>
            </div>
          </>
        ) : showRemoteBanner ? (
          <>
            <p className="min-w-0 text-caption [color:var(--color-fg-muted)]">
              Updated on another device
            </p>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                className="h-7 border-transparent px-2.5 text-caption [background-color:var(--color-accent)] [color:var(--color-accent-fg)] hover:brightness-95 pointer-events-auto"
                size="sm"
                type="button"
                onClick={onReloadRemote}
              >
                Reload
              </Button>

              <Button
                className="h-7 border-[var(--color-border)] px-2.5 text-caption [background-color:var(--color-card-overlay)] [color:var(--color-fg-muted)] hover:[background-color:var(--color-card-hover)] hover:[color:var(--color-fg)] pointer-events-auto"
                size="sm"
                type="button"
                variant="outline"
                onClick={onDismissRemoteBanner}
              >
                Keep editing
              </Button>
            </div>
          </>
        ) : (
          <span className="block h-0 w-0" />
        )}
      </div>

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
                className="h-7 w-7 pointer-events-auto"
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
                className="h-7 w-7 pointer-events-auto"
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

        <div className="min-w-0 flex-1">
          <NoteFormLastSaved
            formattedLastEditedAt={formattedLastEditedAt}
            saveFeedback={saveFeedback}
            saveStatus={saveStatus}
            variant="inline"
          />
        </div>
      </div>
    </footer>
  );
}
