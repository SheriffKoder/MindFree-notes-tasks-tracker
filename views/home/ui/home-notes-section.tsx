/**
 * @file views/home/ui/home-notes-section.tsx
 * Client island for Home notes — category switcher, empty Home state, drawer.
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  useHomeNotesQuery,
  useNoteCategoriesQuery,
  useNotesRealtimeSync,
  type HomeNotesStrip,
  type Note,
} from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { useAuthUserId, useOfflineSync } from "@/shared/offline-queue";
import { QueryStatePanel } from "@/shared/react-query";
import { selectDiaryStrip } from "@/views/home/lib/select-diary-strip";
import { HomeNotesStrip as HomeNotesStripView } from "@/views/home/ui/home-notes-strip";
import { HomeNotesStripHeader } from "@/views/home/ui/home-notes-strip-header";
import { HomePaymentQuickAdd } from "@/views/home/ui/home-payment-quick-add";
import { HomeQuickAddIcon } from "@/views/home/ui/home-quick-add-icon";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";

interface HomeNotesHeaderActionsProps {
  canAddNote: boolean;
  onAddNote: () => void;
}

function HomeNotesHeaderActions({
  canAddNote,
  onAddNote,
}: HomeNotesHeaderActionsProps) {
  const addLabel = canAddNote
    ? "Add note"
    : "Add note unavailable until a category exists";

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <HomePaymentQuickAdd />
      <Button
        aria-label={addLabel}
        className="shrink-0"
        disabled={!canAddNote}
        size="icon"
        title={addLabel}
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
  );
}

interface HomeNotesStripAreaProps {
  canAddNote: boolean;
  strips: HomeNotesStrip[];
  onNoteClick: (note: Note) => void;
  onQuickPlaceholderClick: (categoryId: string) => void;
  onAddNote: () => void;
}

function HomeNotesStripArea({
  canAddNote,
  strips,
  onNoteClick,
  onQuickPlaceholderClick,
  onAddNote,
}: HomeNotesStripAreaProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [twoRowByCategory, setTwoRowByCategory] = useState<
    Record<string, boolean>
  >({});

  const selectedStrip =
    strips.find((strip) => strip.categoryId === selectedCategoryId) ??
    strips[0] ??
    null;

  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleToggleTwoRows = useCallback(() => {
    if (!selectedStrip) {
      return;
    }

    const categoryId = selectedStrip.categoryId;

    setTwoRowByCategory((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }, [selectedStrip]);

  if (strips.length === 0 || !selectedStrip) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-end">
          <HomeNotesHeaderActions canAddNote={canAddNote} onAddNote={onAddNote} />
        </div>
        <QueryStatePanel
          className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
          message="No note categories on Home."
        />
      </div>
    );
  }

  const isTwoRows = Boolean(twoRowByCategory[selectedStrip.categoryId]);
  const cardCount = 1 + selectedStrip.starredNotes.length;
  const showTwoRowToggle = cardCount >= 3;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <HomeNotesStripHeader
          isTwoRows={isTwoRows}
          selectedCategoryId={selectedStrip.categoryId}
          showTwoRowToggle={showTwoRowToggle}
          strips={strips}
          onSelectCategory={handleSelectCategory}
          onToggleTwoRows={handleToggleTwoRows}
        />
        <HomeNotesHeaderActions canAddNote={canAddNote} onAddNote={onAddNote} />
      </div>

      <HomeNotesStripView
        isTwoRows={showTwoRowToggle && isTwoRows}
        strip={selectedStrip}
        onNoteClick={onNoteClick}
        onQuickPlaceholderClick={onQuickPlaceholderClick}
      />
    </div>
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
  const { data: homeNotes, isPending, isError, error } = useHomeNotesQuery();
  const { data: categoriesData } = useNoteCategoriesQuery();

  const strips = homeNotes?.strips ?? [];

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

  if (isError) {
    return (
      <QueryStatePanel
        message={error?.message ?? "Failed to load starred notes."}
        variant="error"
      />
    );
  }

  if (isPending && !homeNotes) {
    return <QueryStatePanel message="Loading notes…" />;
  }

  return (
    <>
      <HomeNotesStripArea
        canAddNote={Boolean(defaultCategoryId)}
        strips={strips}
        onAddNote={handleAddNote}
        onNoteClick={handleNoteClick}
        onQuickPlaceholderClick={handleQuickPlaceholderClick}
      />
      <NoteDrawer drawer={drawer} />
    </>
  );
}
