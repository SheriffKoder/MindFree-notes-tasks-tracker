/**
 * @file views/home/ui/home-notes-section.tsx
 * Client island for the Home starred-notes card — header actions, strips, drawer.
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  useHomeNotesQuery,
  useNoteCategoriesQuery,
  useNotesRealtimeSync,
  type Note,
} from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { cn } from "@/lib/utils";
import { useAuthUserId, useOfflineSync } from "@/shared/offline-queue";
import { QueryStatePanel } from "@/shared/react-query";
import { selectDiaryStrip } from "@/views/home/lib/select-diary-strip";
import { HOME_SECTION_HEADER_CLASS } from "@/views/home/lib/section-header-class";
import { HomeNotesStrip } from "@/views/home/ui/home-notes-strip";
import { HomePaymentQuickAdd } from "@/views/home/ui/home-payment-quick-add";
import { HomeQuickAddIcon } from "@/views/home/ui/home-quick-add-icon";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";

interface HomeNotesStripAreaProps {
  onNoteClick: (note: Note) => void;
  onQuickPlaceholderClick: (categoryId: string) => void;
  onAddNote: () => void;
}

function HomeNotesStripArea({
  onNoteClick,
  onQuickPlaceholderClick,
  onAddNote,
}: HomeNotesStripAreaProps) {
  const [isTwoRows, setIsTwoRows] = useState(false);
  const { data, isPending, isError, error } = useHomeNotesQuery();

  const toggleRowLayout = useCallback(() => {
    setIsTwoRows((current) => !current);
  }, []);

  if (isError) {
    return (
      <QueryStatePanel
        message={error?.message ?? "Failed to load starred notes."}
        variant="error"
      />
    );
  }

  if (isPending && !data) {
    return <QueryStatePanel message="Loading notes…" />;
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          aria-controls="home-starred-notes-strip"
          aria-expanded={isTwoRows}
          aria-label={
            isTwoRows
              ? "Show starred notes in one row"
              : "Show starred notes in two rows"
          }
          className={cn(
            HOME_SECTION_HEADER_CLASS,
            "rounded-sm text-left transition-colors hover:[color:var(--color-fg)] flex items-center gap-1",
          )}
          type="button"
          onClick={toggleRowLayout}
        >
          Starred Notes
          {isTwoRows ? (
            <ChevronUp aria-hidden className="h-4 w-4" />
          ) : (
            <ChevronDown aria-hidden className="h-4 w-4" />
          )}
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <HomePaymentQuickAdd />
          <Button
            aria-label="Add note"
            className="shrink-0"
            size="icon"
            title="Add note"
            type="button"
            variant="ghost"
            onClick={onAddNote}
          >
            <HomeQuickAddIcon>
              <FileText
                aria-hidden
                className="h-4 w-4 [color:var(--color-fg-muted)]"
              />
            </HomeQuickAddIcon>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {data?.strips.map((strip) => (
          <div key={strip.categoryId}>
            {data.strips.length > 1 ? (
              <p className="mb-2 text-sm font-medium text-body-muted">
                {strip.categoryName}
              </p>
            ) : null}
            <HomeNotesStrip
              isTwoRows={isTwoRows}
              strip={strip}
              onNoteClick={onNoteClick}
              onQuickPlaceholderClick={onQuickPlaceholderClick}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export function HomeNotesSection() {
  const queryClient = useQueryClient();
  const userId = useAuthUserId();
  const notesOfflineAdapter = useMemo(
    () => createNotesOfflineSyncAdapter(queryClient),
    [queryClient],
  );

  useNotesRealtimeSync({
    onNoteChange: notifyNoteDrawerRealtime,
  });

  useOfflineSync(userId, [notesOfflineAdapter]);

  const drawer = useNotesDrawer();
  const { openCreateGeneral, openCreateQuick, openEdit } = drawer;
  const { data: homeNotes } = useHomeNotesQuery();
  const { data: categoriesData } = useNoteCategoriesQuery();

  const defaultCategoryId = useMemo(
    () =>
      categoriesData?.categories.find((category) => category.isDefault)?.id ??
      categoriesData?.categories[0]?.id ??
      selectDiaryStrip(homeNotes ?? undefined)?.categoryId ??
      "",
    [categoriesData?.categories, homeNotes],
  );

  const handleNoteClick = useCallback(
    (note: Note) => {
      openEdit(note.id);
    },
    [openEdit],
  );

  const handleAddNote = useCallback(() => {
    if (!defaultCategoryId) {
      return;
    }

    openCreateGeneral(defaultCategoryId);
  }, [defaultCategoryId, openCreateGeneral]);

  const handleQuickPlaceholderClick = useCallback(
    (categoryId: string) => {
      const strip =
        homeNotes?.strips.find((entry) => entry.categoryId === categoryId) ??
        null;
      const existingQuickId = strip?.quickNote?.id;

      if (existingQuickId) {
        openEdit(existingQuickId);
        return;
      }

      openCreateQuick(categoryId);
    },
    [homeNotes?.strips, openCreateQuick, openEdit],
  );

  return (
    <>
      <HomeNotesStripArea
        onAddNote={handleAddNote}
        onNoteClick={handleNoteClick}
        onQuickPlaceholderClick={handleQuickPlaceholderClick}
      />
      <NoteDrawer drawer={drawer} />
    </>
  );
}
