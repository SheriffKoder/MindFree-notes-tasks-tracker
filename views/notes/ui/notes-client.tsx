/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page (hydration in Step 5).
 */

"use client";

import type {
  Note,
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import { aggregateMonthNotes } from "@/entities/note/transform/aggregate-month-notes";
import { MonthNavigator, useMonthNavigation } from "@/shared/month-navigator";
import {
  ViewSwitcher,
  useViewNavigation,
  type NotesViewId,
} from "@/shared/view-switcher";
import { NotesViewsSection } from "@/views/notes/ui/notes-views-section";
import { useNotesPageSelection } from "@/views/notes/model/use-notes-page-selection";

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

function buildMockData(
  month: string,
  initialCalendarNotes: CalendarNotesResponse,
  initialGeneralNotes: GeneralNotesResponse,
): {
  calendarNotes: CalendarNotesResponse;
  generalNotes: GeneralNotesResponse;
} {
  const allMockMonthNotes: Note[] = [
    {
      id: "mock-note-june-1",
      date: "2026-06-06",
      title: "Hi\nMy name is\nEarth\nand I'm a \nplanet",
      content: "Outlined list view patterns and week grouping for month notes.",
      starred: true,
      isImportant: true,
      isQuick: false,
      lastEditedAt: "2026-06-06T10:15:00.000Z",
    },
    {
      id: "mock-note-june-2",
      date: "2026-06-27",
      title: "June retrospective",
      content: "Reviewed notes from this month and extracted reusable list patterns.",
      starred: false,
      isImportant: false,
      isQuick: false,
      lastEditedAt: "2026-06-27T16:40:00.000Z",
    },
    {
      id: "mock-note-july-1",
      date: "2026-07-09",
      title: "July planning",
      content: "Ship Step 4a list view polish and prep Step 4b calendar layout.",
      starred: true,
      isImportant: false,
      isQuick: false,
      lastEditedAt: "2026-07-09T10:15:00.000Z",
    },
  ];

  const mockMonthNotes = allMockMonthNotes.filter(
    (note) => note.date?.startsWith(month),
  );

  const mockGeneralNotes: Note[] = [
    {
      id: "mock-general-july",
      date: null,
      title: "July priorities",
      content: "Keep drawer navigation independent from month URL state.",
      starred: true,
      isImportant: false,
      isQuick: false,
      lastEditedAt: "2026-07-08T13:30:00.000Z",
    },
    {
      id: "mock-general-june",
      date: null,
      title: "June learnings",
      content: "Prefer small focused containers when prop surfaces stay simple.",
      starred: false,
      isImportant: true,
      isQuick: false,
      lastEditedAt: "2026-06-21T09:05:00.000Z",
    },
  ];

  const monthNotes = [...mockMonthNotes, ...initialCalendarNotes.monthNotes];
  const calendarDays = aggregateMonthNotes(month, monthNotes);

  return {
    calendarNotes: {
      ...initialCalendarNotes,
      month,
      monthNotes,
      calendarDays,
    },
    generalNotes: {
      ...initialGeneralNotes,
      generalNotes: [...mockGeneralNotes, ...initialGeneralNotes.generalNotes],
    },
  };
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
  const { highlightedDate, selectDate } = useNotesPageSelection(month);
  const mockData = buildMockData(month, initialCalendarNotes, initialGeneralNotes);

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="text-body-muted">
          Browse calendar notes by month. Lists, calendar grid, and the drawer
          arrive in the next steps.
        </p>
      </section>

      <section
        aria-label="Notes controls"
        className="flex shrink-0 flex-row items-stretch gap-3"
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

      <div className="relative min-h-0 flex-1">
        {/* shadow over the list view when scrolling and padding on the scrollable area to avoid overlaying the content */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
        />
        <div className="h-full min-h-0 overflow-x-auto overflow-y-auto pt-4 md:pt-5">
          <NotesViewsSection
            month={month}
            view={view}
            initialCalendarNotes={mockData.calendarNotes}
            initialGeneralNotes={mockData.generalNotes}
            highlightedDate={highlightedDate}
            onDateSelect={selectDate}
          />
        </div>
      </div>
    </div>
  );
}
