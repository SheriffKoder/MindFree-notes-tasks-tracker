/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page — layout, URL state, and TanStack query islands.
 */

"use client";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { CalendarDay, Note } from "@/entities/note";
import { useNotesRealtimeSync } from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { MonthNavigator } from "@/shared/month-navigator";
import {
  OfflineBanner,
  useAuthUserId,
  useOfflineSync,
} from "@/shared/offline-queue";
import { ViewSwitcher } from "@/shared/view-switcher";
import { NOTES_VIEW_CONFIG } from "@/views/notes/lib/notes-views";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";
import { useNotesPageSelection } from "@/views/notes/model/use-notes-page-selection";
import { useNotesUrlState } from "@/views/notes/model/use-notes-url-state";
import { NotesViewsSection } from "@/views/notes/ui/notes-views-section";
import { NotesAddButton } from "@/views/notes/ui/notes-add-button";

/**
 * Renders the Notes page shell with month/view controls and hydrated query islands.
 */
export function NotesClient() {

  // Offline sync
  const queryClient = useQueryClient();
  const userId = useAuthUserId();
  const notesOfflineAdapter = useMemo(
    () => createNotesOfflineSyncAdapter(queryClient),
    [queryClient],
  );

  // URL state
  const { month, view, previousMonth, nextMonth, changeView, cycleView } = useNotesUrlState();
  
  // Page selection
  const { highlightedDate, selectDate, clearSelection } = useNotesPageSelection(month);
  
  // Drawer options
  const drawer = useNotesDrawer();

  useNotesRealtimeSync({
    onNoteChange: notifyNoteDrawerRealtime,
  });

  // Offline sync
  useOfflineSync(userId, [notesOfflineAdapter]);

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

  const handleAddNote = useCallback(() => {
    clearSelection();
    drawer.openCreateGeneral();
  }, [clearSelection, drawer.openCreateGeneral]);

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4">
      <OfflineBanner />
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="page-header__subtitle">
          Browse calendar notes by month. Click a day or list card to open the
          note editor.
        </p>
      </section>

      <section
        aria-label="Notes controls"
        className="flex shrink-0 flex-row items-center justify-between gap-3"
      >
        <MonthNavigator
          className="min-w-0 flex-1"
          month={month}
          onPrevious={previousMonth}
          onNext={nextMonth}
        />
        <div className="flex shrink-0 items-center gap-2">
          <ViewSwitcher
            config={NOTES_VIEW_CONFIG}
            view={view}
            onViewChange={changeView}
            onCycleView={cycleView}
          />
          <NotesAddButton onClick={handleAddNote} />
        </div>
      </section>

      <div className="relative min-h-0 flex-1">
        {/* shadow over the list view when scrolling and padding on the scrollable area to avoid overlaying the content */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
        />
        <div className="flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
          <div className="min-h-0 flex-1">
            <NotesViewsSection
              month={month}
              view={view}
              highlightedDate={highlightedDate}
              onCalendarDaySelect={handleCalendarDaySelect}
              onNoteClick={handleNoteClick}
            />
          </div>
        </div>
      </div>

      <NoteDrawer drawer={drawer} onDismiss={clearSelection} />
    </div>
  );
}
