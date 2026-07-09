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

/**
 * Props for the Notes client island.
 */
export interface NotesClientProps {
  /** Resolved URL month (`YYYY-MM`). */
  month: string;
  /** SSR calendar payload — wired to TanStack Query in Step 5. */
  initialCalendarNotes: CalendarNotesResponse;
  /** SSR general notes payload — wired to TanStack Query in Step 5. */
  initialGeneralNotes: GeneralNotesResponse;
}

/**
 * Renders the Notes page client boundary with SSR payloads held for hydration.
 *
 * @param props - month and initial server payloads
 * @returns Notes page shell with month navigation
 */
export function NotesClient({
  month,
  initialCalendarNotes,
  initialGeneralNotes,
}: NotesClientProps) {

  // What: useMonthNavigation is a hook that returns the onPrevious and onNext functions
  // Why: Changes the month URL parameter
  const { onPrevious, onNext } = useMonthNavigation(month);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="text-body-muted">
          Browse calendar notes by month. Lists, calendar grid, and the drawer
          arrive in the next steps.
        </p>
      </section>

      <section aria-label="Notes controls">
        <MonthNavigator
          month={month}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--color-border)] p-4">
        <p className="text-body-muted">
          Calendar data for {month}: {initialCalendarNotes.calendarDays.length}{" "}
          days, {initialCalendarNotes.monthNotes.length} notes. General notes:{" "}
          {initialGeneralNotes.generalNotes.length} (unchanged when month
          changes).
        </p>
      </section>
    </div>
  );
}
