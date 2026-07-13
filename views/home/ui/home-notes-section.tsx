/**
 * @file views/home/ui/home-notes-section.tsx
 * Client island for the Home starred-notes card — strip + shared note drawer.
 *
 * Purpose: Wire home read model UI to the existing Notes editor.
 * Used in: views/home/index.tsx
 * Used for: Step 2 — card clicks open {@link NoteDrawer} in edit or quick-create mode.
 */

"use client";

import { useCallback } from "react";

import { useNotesRealtimeSync, type Note } from "@/entities/note/client";
import { NoteDrawer } from "@/features/notes/note-drawer";
import { notifyNoteDrawerRealtime } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";
import { useNotesDrawer } from "@/views/notes/model/editor/use-notes-drawer";
import { HomeNotesStrip } from "@/views/home/ui/home-notes-strip";

/**
 * Starred Notes card body with horizontal strip and editor drawer.
 */
export function HomeNotesSection() {
  const drawer = useNotesDrawer();
  const { openCreateQuick, openEdit } = drawer;

  useNotesRealtimeSync({
    onNoteChange: notifyNoteDrawerRealtime,
  });

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
