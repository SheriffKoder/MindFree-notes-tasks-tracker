/**
 * @file views/home/ui/home-notes-section.tsx
 * Client island for the Home starred-notes card — strip + shared note drawer.
 *
 * Purpose: Wire home read model UI to the existing Notes editor.
 * Used in: views/home/index.tsx
 * Used for: Step 2 — card clicks open {@link NoteDrawer} in edit or quick-create mode.
 */

"use client";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useNotesRealtimeSync, type Note } from "@/entities/note/client";
import { createNotesOfflineSyncAdapter } from "@/entities/note/offline/notes-offline-storage";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { useAuthUserId, useOfflineSync } from "@/shared/offline-queue";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";
import { HomeNotesStrip } from "@/views/home/ui/home-notes-strip";

/**
 * Starred Notes card body with horizontal strip and editor drawer.
 */
export function HomeNotesSection() {
  const queryClient = useQueryClient();
  const userId = useAuthUserId();
  const notesOfflineAdapter = useMemo(
    () => createNotesOfflineSyncAdapter(queryClient),
    [queryClient],
  );
  const drawer = useNotesDrawer();
  const { openCreateQuick, openEdit } = drawer;

  useNotesRealtimeSync({
    onNoteChange: notifyNoteDrawerRealtime,
  });

  useOfflineSync(userId, [notesOfflineAdapter]);

  const handleNoteClick = useCallback(
    (note: Note) => {
      openEdit(note.id);
    },
    [openEdit],
  );

  const handleQuickPlaceholderClick = useCallback(() => {
    openCreateQuick();
  }, [openCreateQuick]);

  return (
    <>
      <HomeNotesStrip
        onNoteClick={handleNoteClick}
        onQuickPlaceholderClick={handleQuickPlaceholderClick}
      />
      <NoteDrawer drawer={drawer} />
    </>
  );
}
