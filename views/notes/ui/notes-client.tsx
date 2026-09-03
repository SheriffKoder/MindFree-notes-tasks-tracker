/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page — layout, URL state, and TanStack query islands.
 *
 * Purpose: Compose month/view controls and hydrated query panes.
 * Used in: views/notes (Notes page shell)
 * Used for: Dynamic category views + add-note with selected categoryId.
 *
 * Steps:
 * 1. Load active categories (SSR-seeded)
 * 2. Build view config + resolve URL state
 * 3. Derive add-note default category (view category or Diary)
 * 4. Render toolbar + views + note drawer + category manage drawer
 *    Category for a new note is chosen inside the editor drawer.
 */

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { CalendarDay, Note } from "@/entities/note";
import { useNoteCategoriesQuery, useNotesRealtimeSync } from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline";
import { NoteCategoryDrawer } from "@/features/notes/note-category-drawer";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { MonthNavigator } from "@/shared/month-navigator";
import {
  OfflineBanner,
  useAuthUserId,
  useOfflineSync,
} from "@/shared/offline-queue";
import { PageHeader } from "@/shared/page-header";
import { ViewSwitcher } from "@/shared/view-switcher";
import {
  buildNotesViewConfig,
  parseCategoryViewId,
} from "@/views/notes/lib/notes-views";
import { useNoteCategoriesDrawer } from "@/views/notes/model/editor/use-note-categories-drawer";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";
import { useNotesPageSelection } from "@/views/notes/model/use-notes-page-selection";
import { useNotesUrlState } from "@/views/notes/model/use-notes-url-state";
import { NotesAddButton } from "@/views/notes/ui/notes-add-button";
import { NotesManageCategoriesButton } from "@/views/notes/ui/notes-manage-categories-button";
import { NotesViewsSection } from "@/views/notes/ui/notes-views-section";

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

  /////////////////////////////////////////////////////////////
  // Categories → dynamic view config (SSR-seeded, no empty flash)
  /////////////////////////////////////////////////////////////
  const { data: categoriesData } = useNoteCategoriesQuery();
  const categories = categoriesData?.categories ?? [];

  const viewConfig = useMemo(
    () => buildNotesViewConfig(categories),
    [categories],
  );

  // URL state — config + categories for legacy general-notes remap
  const { month, view, previousMonth, nextMonth, changeView, cycleView } =
    useNotesUrlState(viewConfig, categories);

  // Page selection
  const { highlightedDate, selectDate, clearSelection } = useNotesPageSelection(month);

  // Drawer options
  const drawer = useNotesDrawer();
  const categoriesDrawer = useNoteCategoriesDrawer();

  /////////////////////////////////////////////////////////////
  // Opening the note editor closes the category manager (one overlay)
  /////////////////////////////////////////////////////////////
  useEffect(function closeCategoriesWhenNoteDrawerOpen() {
    if (drawer.isOpen) {
      categoriesDrawer.close();
    }
  }, [categoriesDrawer.close, drawer.isOpen]);

  /////////////////////////////////////////////////////////////
  // Add-note default category: follow category view, else Diary / first
  // The drawer picker can still change this before the first save.
  /////////////////////////////////////////////////////////////
  const defaultCategoryId =
    categories.find((category) => category.isDefault)?.id ??
    categories[0]?.id ??
    "";

  const viewCategoryId = parseCategoryViewId(view);

  const addNoteCategoryId = viewCategoryId ?? defaultCategoryId;

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

      // Calendar create stays category-free
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

    if (!addNoteCategoryId) {
      return;
    }

    drawer.openCreateGeneral(addNoteCategoryId);
  }, [addNoteCategoryId, clearSelection, drawer.openCreateGeneral]);

  const handleOpenCategories = useCallback(() => {
    // Close the note editor first so only this manager is open
    drawer.close();
    categoriesDrawer.open();
  }, [categoriesDrawer.open, drawer.close]);

  const handleCategoryRemoved = useCallback(
    (categoryId: string) => {
      // Archived / hard-deleted categories leave the switcher
      if (parseCategoryViewId(view) === categoryId) {
        changeView("calendar");
      }
    },
    [changeView, view],
  );

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4">
      <OfflineBanner />
      <PageHeader
        title="Notes"
        subtitle={
          <>
            Browse calendar notes by month. Click a day or list card to open the
            note editor.
          </>
        }
      />

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
            config={viewConfig}
            view={view}
            onViewChange={changeView}
            onCycleView={cycleView}
          />
          <NotesManageCategoriesButton onClick={handleOpenCategories} />
          <NotesAddButton onClick={handleAddNote} />
        </div>
      </section>

      <div className="relative min-h-0 flex-1">
        {/* shadow over the list view when scrolling and padding on the scrollable area to avoid overlaying the content */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
        />
        <div className="custom-scrollbar flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
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
      <NoteCategoryDrawer
        open={categoriesDrawer.isOpen}
        onCategoryRemoved={handleCategoryRemoved}
        onClose={categoriesDrawer.close}
      />
    </div>
  );
}
