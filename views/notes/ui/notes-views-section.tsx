/**
 * @file views/notes/ui/notes-views-section.tsx
 * Notes page views container (calendar grid, month notes list, general notes list).
 */

"use client";

import { useCallback, useMemo } from "react";

import {
  useCalendarNotesQuery,
  useGeneralNotesQuery,
  type Note,
  type CalendarDay,
} from "@/entities/note/client";
import { NoteCalendarCell } from "@/features/notes/note-calendar-cell";
import { NoteListCard } from "@/features/notes/note-list-card";
import { MonthCalendar, type CalendarCellRenderContext } from "@/shared/calendar";
import { ListView } from "@/shared/list-view";
import { QueryStatePanel } from "@/shared/react-query";
import type { NotesViewId } from "@/shared/view-switcher";
import { usePrefetchAdjacentCalendarMonths } from "@/views/notes/model/use-prefetch-adjacent-calendar-months";
import { resolveViewQueryState } from "@/views/notes/lib/resolve-view-query-state";
import { getReservedMeta } from "@/views/notes/lib/reserved-meta";

export interface NotesViewsSectionProps {
  month: string;
  view: NotesViewId;
  /** In-month highlight for the calendar grid (from page selection hook). */
  highlightedDate?: string;
  /** Snaps page selection (and later the drawer) to the clicked calendar day. */
  onDateSelect: (date: string) => void;
}

/**
 * Stable key extractor for list rows — module-level so referential identity never changes.
 */
function getNoteKey(note: Note): string {
  return note.id;
}

export function NotesViewsSection({
  month,
  view,
  highlightedDate,
  onDateSelect,
}: NotesViewsSectionProps) {
  const calendarQuery = useCalendarNotesQuery(month);
  const generalQuery = useGeneralNotesQuery();
  const { data: calendarNotes } = calendarQuery;
  const { data: generalNotes } = generalQuery;

  usePrefetchAdjacentCalendarMonths(month, calendarQuery.isSuccess);

  const viewQueryState = resolveViewQueryState(view, calendarQuery, generalQuery);

  // Stable renderCell ref lets memoized NoteCalendarCell skip re-renders when day data is unchanged.
  const renderCalendarCell = useCallback(
    (day: CalendarDay, { isToday }: CalendarCellRenderContext) => (
      <NoteCalendarCell
        day={day}
        isToday={isToday}
        isSelected={highlightedDate === day.date}
      />
    ),
    [highlightedDate],
  );

  // Stable config object for CardGridMobile → WeekOrganizer (avoids regroup on parent re-render).
  const monthNotesWeekGrouping = useMemo(
    () => ({ month, dateKey: "date" as const, defaultOpen: true }),
    [month],
  );

  // Stable renderItem refs let memoized NoteListCard skip re-renders when note data is unchanged.
  const renderMonthNote = useCallback((note: Note) => {
    const reserved = getReservedMeta("month-notes", note);

    return (
      <NoteListCard
        note={note}
        reserved={reserved.value}
        reservedKind={reserved.kind}
      />
    );
  }, []);

  // Stable renderItem refs let memoized NoteListCard skip re-renders when note data is unchanged.
  const renderGeneralNote = useCallback((note: Note) => {
    const reserved = getReservedMeta("general-notes", note);

    return (
      <NoteListCard
        note={note}
        reserved={reserved.value}
        reservedKind={reserved.kind}
      />
    );
  }, []);

  if (viewQueryState.kind !== "ready") {
    return (
      <QueryStatePanel
        message={viewQueryState.message}
        variant={viewQueryState.kind}
      />
    );
  }

  return (
    <section>
      {view === "calendar" && calendarNotes ? (
        <div className="w-max min-w-full">
          <MonthCalendar
            className="min-w-[42rem] md:min-w-0"
            month={month}
            calendarDays={calendarNotes.calendarDays}
            selectedDate={highlightedDate}
            onDaySelect={onDateSelect}
            renderCell={renderCalendarCell}
          />
        </div>
      ) : null}

      {view === "month-notes" && calendarNotes ? (
        <ListView
          items={calendarNotes.monthNotes}
          getKey={getNoteKey}
          weekGrouping={monthNotesWeekGrouping}
          renderItem={renderMonthNote}
        />
      ) : null}

      {/* Only one list branch mounts at a time — inactive views unmount entirely. */}
      {view === "general-notes" && generalNotes ? (
        <ListView
          items={generalNotes.generalNotes}
          getKey={getNoteKey}
          renderItem={renderGeneralNote}
        />
      ) : null}
    </section>
  );
}
