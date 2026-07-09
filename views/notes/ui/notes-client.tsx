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
import { MonthNavigator, useMonthNavigation } from "@/shared/month-navigator";
import {
  ViewSwitcher,
  useViewNavigation,
  type NotesViewId,
} from "@/shared/view-switcher";
import { NotesViewsSection } from "@/views/notes/ui/notes-views-section";

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
      title: "June planning",
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
    {
      id: "mock-note-june-1",
      date: "2026-06-06",
      title: "June planning",
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

  return {
    calendarNotes: {
      ...initialCalendarNotes,
      monthNotes: [...mockMonthNotes, ...initialCalendarNotes.monthNotes],
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
  const mockData = buildMockData(month, initialCalendarNotes, initialGeneralNotes);

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

      <NotesViewsSection
        month={month}
        view={view}
        initialCalendarNotes={mockData.calendarNotes}
        initialGeneralNotes={mockData.generalNotes}
      />
    </div>
  );
}
