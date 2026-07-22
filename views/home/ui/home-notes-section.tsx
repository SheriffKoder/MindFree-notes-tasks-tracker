/**
 * @file views/home/ui/home-notes-section.tsx
 * Client island for the Home starred-notes card — header actions, strip, drawer.
 *
 * Purpose: Wire home read model UI to the existing Notes editor.
 * Used in: views/home/index.tsx
 * Used for: Header quick-adds + card clicks open NoteDrawer (edit / quick-create).
 *
 * Steps:
 * 1. Mount notes realtime + offline sync for Home writes.
 * 2. Own drawer controller (strip + header share one instance).
 * 3. Render header (title + payment + add-note) → strip → NoteDrawer.
 */

"use client";

import { useCallback, useMemo } from "react";
import { FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useNotesRealtimeSync, type Note } from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { useAuthUserId, useOfflineSync } from "@/shared/offline-queue";
import { HOME_SECTION_HEADER_CLASS } from "@/views/home/lib/section-header-class";
import { HomeNotesStrip } from "@/views/home/ui/home-notes-strip";
import { HomePaymentQuickAdd } from "@/views/home/ui/home-payment-quick-add";
import { HomeQuickAddIcon } from "@/views/home/ui/home-quick-add-icon";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";

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
  const { openCreateQuick, openEdit } = drawer;

  const handleNoteClick = useCallback(
    (note: Note) => {
      openEdit(note.id);
    },
    [openEdit],
  );

  const handleAddNote = useCallback(() => {
    openCreateQuick();
  }, [openCreateQuick]);

  const handleQuickPlaceholderClick = useCallback(() => {
    openCreateQuick();
  }, [openCreateQuick]);

  /////////////////////////////////
  // 3. Header → strip → drawer
  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className={HOME_SECTION_HEADER_CLASS}>Starred Notes</h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <HomePaymentQuickAdd />
          <Button
            aria-label="Add note"
            className="shrink-0"
            size="icon"
            title="Add note"
            type="button"
            variant="ghost"
            onClick={handleAddNote}
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
        onNoteClick={handleNoteClick}
        onQuickPlaceholderClick={handleQuickPlaceholderClick}
      />
      <NoteDrawer drawer={drawer} />
    </>
  );
}
