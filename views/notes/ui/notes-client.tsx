/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page (hydration in Step 5).
 */

"use client";

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import { MonthNavigator, useMonthNavigation } from "@/shared/month-navigator";
import {
  ViewSwitcher,
  getNotesViewDefinition,
  useViewNavigation,
  type NotesViewId,
} from "@/shared/view-switcher";

/**
 * Props for the Notes client island.
 */
export interface NotesClientProps {
  /** Resolved URL month (`YYYY-MM`). */
  month: string;
  /** Resolved URL view. */
  view: NotesViewId;
  /** SSR calendar payload — wired to TanStack Query in Step 5. */
  initialCalendarNotes: CalendarNotesResponse;
  /** SSR general notes payload — wired to TanStack Query in Step 5. */
  initialGeneralNotes: GeneralNotesResponse;
}

/**
 * Placeholder copy for the active view until Steps 4a/4b ship content.
 *
 * @param view - active Notes view
 * @param month - resolved month key
 * @param initialCalendarNotes - SSR calendar payload
 * @param initialGeneralNotes - SSR general notes payload
 * @returns temporary view status text
 */
function getViewPlaceholder(
  view: NotesViewId,
  month: string,
  initialCalendarNotes: CalendarNotesResponse,
  initialGeneralNotes: GeneralNotesResponse,
): string {
  const viewLabel = getNotesViewDefinition(view).label;

  switch (view) {
    case "calendar":
      return `${viewLabel} for ${month}: ${initialCalendarNotes.calendarDays.length} days, ${initialCalendarNotes.monthNotes.length} notes. Calendar grid arrives in Step 4b.`;
    case "month-notes":
      return `${viewLabel} for ${month}: ${initialCalendarNotes.monthNotes.length} notes. List grid arrives in Step 4a.`;
    case "general-notes":
      return `${viewLabel}: ${initialGeneralNotes.generalNotes.length} notes across all months. List grid arrives in Step 4a.`;
  }
}

/**
 * Renders the Notes page client boundary with SSR payloads held for hydration.
 *
 * @param props - month, view, and initial server payloads
 * @returns Notes page shell with month and view controls
 */
export function NotesClient({
  month,
  view,
  initialCalendarNotes,
  initialGeneralNotes,
}: NotesClientProps) {
  const { onPrevious, onNext } = useMonthNavigation(month);
  const { onViewChange, onCycleView } = useViewNavigation(view);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="text-body-muted">
          Browse calendar notes by month. Lists, calendar grid, and the drawer
          arrive in the next steps.
        </p>
      </section>

      <section
        aria-label="Notes controls"
        className="flex flex-row items-stretch gap-3"
      >
        <MonthNavigator
          className="min-w-0 flex-1"
          month={month}
          onPrevious={onPrevious}
          onNext={onNext}
        />
        <ViewSwitcher
          view={view}
          onViewChange={onViewChange}
          onCycleView={onCycleView}
        />
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--color-border)] p-4">
        <p className="text-body-muted">
          {getViewPlaceholder(
            view,
            month,
            initialCalendarNotes,
            initialGeneralNotes,
          )}
        </p>
      </section>
    </div>
  );
}
