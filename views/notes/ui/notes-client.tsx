/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page — layout, URL state, and TanStack query islands.
 */

"use client";

import { useCallback } from "react";

import type { CalendarDay, Note } from "@/entities/note";
import { useNotesRealtimeSync } from "@/entities/note/client";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { MonthNavigator } from "@/shared/month-navigator";
import { ViewSwitcher } from "@/shared/view-switcher";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";
import { useNotesPageSelection } from "@/views/notes/model/use-notes-page-selection";
import { useNotesUrlState } from "@/views/notes/model/use-notes-url-state";
import { NotesViewsSection } from "@/views/notes/ui/notes-views-section";

/**
 * Renders the Notes page shell with month/view controls and hydrated query islands.
 */
export function NotesClient() {
  // URL state
  const { month, view, previousMonth, nextMonth, changeView, cycleView } = useNotesUrlState();
  
  // Page selection
  const { highlightedDate, selectDate } = useNotesPageSelection(month);
  
  // Drawer options
  const drawer = useNotesDrawer();

  useNotesRealtimeSync({
    onNoteChange: notifyNoteDrawerRealtime,
  });

  // Handlers for view interactions
  const handleCalendarDaySelect = useCallback(
    (day: CalendarDay) => {
      selectDate(day.date);

      if (day.note) {
        drawer.openEdit(day.note.id);
        return;
      }

      drawer.openCreateForDate(day.date);
    },
    [drawer.openCreateForDate, drawer.openEdit, selectDate],
  );

  // Handler for note clicks
  const handleNoteClick = useCallback(
    (note: Note) => {
      if (note.date) {
        selectDate(note.date);
      }

      drawer.openEdit(note.id);
    },
    [drawer.openEdit, selectDate],
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="text-body-muted">
          Browse calendar notes by month. Click a day or list card to open the
          note editor.
        </p>
      </section>

      <section
        aria-label="Notes controls"
        className="flex shrink-0 flex-row items-stretch gap-3"
      >
        <MonthNavigator
          className="min-w-0 flex-1"
          month={month}
          onPrevious={previousMonth}
          onNext={nextMonth}
        />
        <ViewSwitcher
          view={view}
          onViewChange={changeView}
          onCycleView={cycleView}
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
            highlightedDate={highlightedDate}
            onCalendarDaySelect={handleCalendarDaySelect}
            onNoteClick={handleNoteClick}
          />
        </div>
      </div>

      <NoteDrawer drawer={drawer} />
    </div>
  );
}
