/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page — layout, URL state, and TanStack query islands.
 */

"use client";

import { useCallback, useState } from "react";

import type { Note } from "@/entities/note";
import { AppDrawer } from "@/shared/drawer";
import { MonthNavigator, useMonthNavigation } from "@/shared/month-navigator";
import {
  ViewSwitcher,
  useViewNavigation,
} from "@/shared/view-switcher";
import { useNotesPageSelection } from "@/views/notes/model/use-notes-page-selection";
import { useNotesUrlState } from "@/views/notes/model/use-notes-url-state";
import { NotesViewsSection } from "@/views/notes/ui/notes-views-section";

/**
 * Renders the Notes page shell with month/view controls and hydrated query islands.
 */
export function NotesClient() {
  const { month, view } = useNotesUrlState();
  const { onPrevious, onNext } = useMonthNavigation(month);
  const { onViewChange, onCycleView } = useViewNavigation(view);
  const { selectedDate, highlightedDate, selectDate } =
    useNotesPageSelection(month);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  /** Opens drawer shell on calendar day click — replaced by `NoteDrawer` in Step 8. */
  const handleDateSelect = useCallback(
    (date: string) => {
      selectDate(date);
      setSelectedNote(null);
      setDrawerOpen(true);
    },
    [selectDate],
  );

  /** Opens drawer shell on list card click — replaced by `NoteDrawer` in Step 8. */
  const handleNoteClick = useCallback(
    (note: Note) => {
      if (note.date) {
        selectDate(note.date);
      }

      setSelectedNote(note);
      setDrawerOpen(true);
    },
    [selectDate],
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="text-body-muted">
          Browse calendar notes by month. Click a day or list card to open the
          drawer shell.
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
            highlightedDate={highlightedDate}
            onDateSelect={handleDateSelect}
            onNoteClick={handleNoteClick}
          />
        </div>
      </div>

      <AppDrawer
        ariaLabel="Note editor"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <div className="flex flex-col gap-3">
          <p className="text-body">
            Drawer shell — note editor arrives in Steps 7–8.
          </p>
          {selectedNote ? (
            <p className="text-body-muted text-sm">
              Note: {selectedNote.title || selectedNote.content || selectedNote.id}
            </p>
          ) : selectedDate ? (
            <p className="text-body-muted text-sm">Selected: {selectedDate}</p>
          ) : null}
          {/* Placeholder blocks to verify scroll inside the panel */}
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index} className="text-body-muted text-sm">
              Scroll test line {index + 1}
            </p>
          ))}
        </div>
      </AppDrawer>
    </div>
  );
}
