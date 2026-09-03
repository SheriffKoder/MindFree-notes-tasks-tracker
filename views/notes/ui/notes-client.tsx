/**
 * @file views/notes/ui/notes-client.tsx
 * Client boundary for the Notes page — layout, URL state, and TanStack query islands.
 *
 * Purpose: Compose month/view controls, category picker, and hydrated query panes.
 * Used in: views/notes (Notes page shell)
 * Used for: Dynamic category views + add-note with selected categoryId.
 *
 * Steps:
 * 1. Load active categories (SSR-seeded)
 * 2. Build view config + resolve URL state
 * 3. Derive add-note category (view category or Diary)
 * 4. Render toolbar + views + drawer
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { CalendarDay, Note } from "@/entities/note";
import { useNoteCategoriesQuery, useNotesRealtimeSync } from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline";
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
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";
import { useNotesPageSelection } from "@/views/notes/model/use-notes-page-selection";
import { useNotesUrlState } from "@/views/notes/model/use-notes-url-state";
import { NotesAddButton } from "@/views/notes/ui/notes-add-button";
import { NotesCategorySelect } from "@/views/notes/ui/notes-category-select";
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

  /////////////////////////////////////////////////////////////
  // Add-note category: follow category view, else Diary / first
  /////////////////////////////////////////////////////////////
  const defaultCategoryId =
    categories.find((category) => category.isDefault)?.id ??
    categories[0]?.id ??
    "";

  const viewCategoryId = parseCategoryViewId(view);

  // Null means "no user override" — derive from view or Diary
  const [overrideCategoryId, setOverrideCategoryId] = useState<string | null>(
    null,
  );

  // When the URL view changes, drop the override so the new view / Diary wins
  useEffect(function resetCategoryOverrideOnViewChange() {
    setOverrideCategoryId(null);
  }, [view]);

  const effectiveCategoryId =
    overrideCategoryId ?? viewCategoryId ?? defaultCategoryId;

  const handleCategorySelectChange = useCallback((categoryId: string) => {
    setOverrideCategoryId(categoryId);
  }, []);

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

    if (!effectiveCategoryId) {
      return;
    }

    drawer.openCreateGeneral(effectiveCategoryId);
  }, [clearSelection, drawer.openCreateGeneral, effectiveCategoryId]);

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
          <NotesCategorySelect
            categories={categories}
            value={effectiveCategoryId}
            onValueChange={handleCategorySelectChange}
            disabled={!defaultCategoryId}
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
    </div>
  );
}
