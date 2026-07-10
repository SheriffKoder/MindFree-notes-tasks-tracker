/**
 * @file views/notes/ui/notes-views-section.tsx
 * Notes page views container (calendar grid, month notes list, general notes list).
 */

"use client";

import { useCallback, useMemo } from "react";

import type {
  Note,
  CalendarDay,
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import { NoteCalendarCell } from "@/features/notes/note-calendar-cell";
import { NoteListCard } from "@/features/notes/note-list-card";
import { MonthCalendar, type CalendarCellRenderContext } from "@/shared/calendar";
import { ListView } from "@/shared/list-view";
import type { NotesViewId } from "@/shared/view-switcher";
import { getReservedMeta } from "@/views/notes/lib/reserved-meta";

export interface NotesViewsSectionProps {
  month: string;
  view: NotesViewId;
  initialCalendarNotes: CalendarNotesResponse;
  initialGeneralNotes: GeneralNotesResponse;
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
  initialCalendarNotes,
  initialGeneralNotes,
  highlightedDate,
  onDateSelect,
}: NotesViewsSectionProps) {
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

  return (
    <section>
      {view === "calendar" ? (
        <div className="w-max min-w-full">
          <MonthCalendar
            className="min-w-[42rem] md:min-w-0"
            month={month}
            calendarDays={initialCalendarNotes.calendarDays}
            selectedDate={highlightedDate}
            onDaySelect={onDateSelect}
            renderCell={renderCalendarCell}
          />
        </div>
      ) : null}

      {view === "month-notes" ? (
        <ListView
          items={initialCalendarNotes.monthNotes}
          getKey={getNoteKey}
          weekGrouping={monthNotesWeekGrouping}
          renderItem={renderMonthNote}
        />
      ) : null}

      {/* Only one list branch mounts at a time — inactive views unmount entirely. */}
      {view === "general-notes" ? (
        <ListView
          items={initialGeneralNotes.generalNotes}
          getKey={getNoteKey}
          renderItem={renderGeneralNote}
        />
      ) : null}
    </section>
  );
}
