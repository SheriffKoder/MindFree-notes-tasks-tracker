/**
 * @file views/home/ui/home-notes-section.tsx
 * Client island for the Home starred-notes card — header actions, strip, drawer.
 *
 * Purpose: Wire home read model UI to the existing Notes editor.
 * Used in: views/home/index.tsx
 * Used for: Header general-create + quick placeholder / card clicks open NoteDrawer.
 *
 * Steps:
 * 1. Mount notes realtime + offline sync for Home writes.
 * 2. Own drawer controller (strip + header share one instance).
 * 3. Render header (title + payment + add-note) → strip → NoteDrawer.
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  useHomeNotesQuery,
  useNotesRealtimeSync,
  type Note,
} from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { cn } from "@/lib/utils";
import { useAuthUserId, useOfflineSync } from "@/shared/offline-queue";
import { HOME_SECTION_HEADER_CLASS } from "@/views/home/lib/section-header-class";
import { HomeNotesStrip } from "@/views/home/ui/home-notes-strip";
import { HomePaymentQuickAdd } from "@/views/home/ui/home-payment-quick-add";
import { HomeQuickAddIcon } from "@/views/home/ui/home-quick-add-icon";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";

interface HomeNotesStripAreaProps {
  onNoteClick: (note: Note) => void;
  onQuickPlaceholderClick: () => void;
  onAddNote: () => void;
}

/**
 * Header + strip only — owns two-row toggle so drawer stays out of that render path.
 */
function HomeNotesStripArea({
  onNoteClick,
  onQuickPlaceholderClick,
  onAddNote,
}: HomeNotesStripAreaProps) {
  const [isTwoRows, setIsTwoRows] = useState(false);

  const toggleRowLayout = useCallback(() => {
    setIsTwoRows((current) => !current);
  }, []);

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
          {isTwoRows ? <ChevronUp aria-hidden className="h-4 w-4" /> : <ChevronDown aria-hidden className="h-4 w-4" />}
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

      <HomeNotesStrip
        isTwoRows={isTwoRows}
        onNoteClick={onNoteClick}
        onQuickPlaceholderClick={onQuickPlaceholderClick}
      />
    </>
  );
}

/**
 * Starred Notes section — header quick-adds, horizontal strip, and editor drawer.
 */
export function HomeNotesSection() {
  /////////////////////////////////
  // 1. Offline + realtime — notes writes from Home
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

  /////////////////////////////////
  // 2. Drawer — strip clicks + header add-note share one controller
  const drawer = useNotesDrawer();
  const { openCreateGeneral, openCreateQuick, openEdit } = drawer;
  const { data: homeNotes } = useHomeNotesQuery();

  const handleNoteClick = useCallback(
    (note: Note) => {
      openEdit(note.id);
    },
    [openEdit],
  );

  /** Header add — new general note (does not fight the one-quick slot). */
  const handleAddNote = useCallback(() => {
    openCreateGeneral();
  }, [openCreateGeneral]);

  /**
   * Empty quick placeholder → create-quick.
   * If the slot is already filled (stale UI), edit the existing quick note.
   */
  const handleQuickPlaceholderClick = useCallback(() => {
    const existingQuickId = homeNotes?.quickNote?.id;

    if (existingQuickId) {
      openEdit(existingQuickId);
      return;
    }

    openCreateQuick();
  }, [homeNotes?.quickNote?.id, openCreateQuick, openEdit]);

  /////////////////////////////////
  // 3. Strip area (toggle state) + drawer (stable sibling)
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
