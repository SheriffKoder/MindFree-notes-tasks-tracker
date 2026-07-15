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
import { usePrefetchAdjacentCalendarMonths } from "@/views/notes/model/use-prefetch-adjacent-calendar-months";
import type { NotesViewId } from "@/views/notes/lib/notes-views";
import { resolveViewQueryState } from "@/views/notes/lib/resolve-view-query-state";
import { getReservedMeta } from "@/views/notes/lib/reserved-meta";

export interface NotesViewsSectionProps {
  month: string;
  view: NotesViewId;
  /** In-month highlight for the calendar grid (from page selection hook). */
  highlightedDate?: string;
  /** Snaps page selection to the clicked calendar day and opens the drawer. */
  onCalendarDaySelect: (day: CalendarDay) => void;
  /** Opens the editor for an existing list note. */
  onNoteClick: (note: Note) => void;
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
  onCalendarDaySelect,
  onNoteClick,
}: NotesViewsSectionProps) {

  // Queries
  const calendarQuery = useCalendarNotesQuery(month);
  const generalQuery = useGeneralNotesQuery();
  const { data: calendarNotes } = calendarQuery;
  const { data: generalNotes } = generalQuery;

  // Prefetch adjacent calendar months
  usePrefetchAdjacentCalendarMonths(month, calendarQuery.isSuccess);

  // View query state for error handling
  const viewQueryState = resolveViewQueryState(view, calendarQuery, generalQuery);

  // Handler for calendar day selects
  const handleCalendarDaySelect = useCallback(
    (date: string) => {
      const day = calendarNotes?.calendarDays.find(
        (calendarDay) => calendarDay.date === date,
      );

      if (day) {
        onCalendarDaySelect(day);
      }
    },
    [calendarNotes?.calendarDays, onCalendarDaySelect],
  );

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

  const sidebarMonthNotesWeekGrouping = useMemo(
    () => ({
      month,
      dateKey: "date" as const,
      defaultOpen: "current-week" as const,
      includeEmptyWeeks: true,
      emptyWeekText: "No notes this week",
    }),
    [month],
  );

  // Stable renderItem refs let memoized NoteListCard skip re-renders when note data is unchanged.
  const renderMonthNote = useCallback(
    (note: Note) => {
      const reserved = getReservedMeta("month-notes", note);

      return (
        <NoteListCard
          note={note}
          reserved={reserved.value}
          reservedKind={reserved.kind}
          variant="mobile"
          onClick={() => onNoteClick(note)}
        />
      );
    },
    [onNoteClick],
  );

  const renderGeneralNote = useCallback(
    (note: Note) => {
      const reserved = getReservedMeta("general-notes", note);

      return (
        <NoteListCard
          note={note}
          reserved={reserved.value}
          reservedKind={reserved.kind}
          onClick={() => onNoteClick(note)}
        />
      );
    },
    [onNoteClick],
  );

  if (viewQueryState.kind !== "ready") {
    return (
      <QueryStatePanel
        message={viewQueryState.message}
        variant={viewQueryState.kind}
      />
    );
  }

  return (
    <section
      className={
        view === "calendar" ? "flex h-full min-h-[600px] flex-col" : undefined
      }
    >
      {view === "calendar" && calendarNotes ? (
      <div className="flex h-full min-h-0 flex-row gap-4">
        <div className="h-full min-h-0 min-w-0 flex-1 overflow-x-auto">
          <MonthCalendar
            className="h-full min-h-[600px] w-full min-w-[42rem] md:min-w-0"
            month={month}
            calendarDays={calendarNotes.calendarDays}
            selectedDate={highlightedDate}
            onDaySelect={handleCalendarDaySelect}
            renderCell={renderCalendarCell}
          />
        </div>

        <div className="hidden h-full min-h-0 w-[30vw] max-w-[400px] shrink-0 flex-col overflow-hidden xl:flex">
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <ListView
              layout="list"
              items={calendarNotes.monthNotes}
              getKey={getNoteKey}
              weekGrouping={sidebarMonthNotesWeekGrouping}
              renderItem={renderMonthNote}
            />
          </div>
        </div>
      </div>
      ) : null}

      {view === "month-notes" && calendarNotes ? (
        <ListView
          layout="list"
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
