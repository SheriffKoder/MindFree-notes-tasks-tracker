/**
 * @file views/notes/model/editor/use-notes-drawer.ts
 * Notes drawer UI state — open/close and the current editor request.
 *
 * Presentation-only: does not fetch notes or create rows. The drawer shell and
 * future `NoteDrawer` interpret {@link NoteEditorRequest}.
 */

"use client";

import { useCallback, useState } from "react";

import type {
  NoteEditorRequest,
  NotesDrawerState,
} from "@/views/notes/model/editor/note-editor-request";

export interface UseNotesDrawerResult {
  isOpen: boolean;
  request: NoteEditorRequest | null;
  /** Opens the editor for an existing note. */
  openEdit: (noteId: string) => void;
  /** Opens a lazy create flow for a calendar day with no note yet. */
  openCreateForDate: (date: string) => void;
  /** Opens a lazy create flow for a new general note. */
  openCreateGeneral: () => void;
  /** Closes the drawer without clearing the last request. */
  close: () => void;
  /** Maps to `AppDrawer` `onOpenChange` — closes when `open === false`. */
  setOpen: (open: boolean) => void;
}

const INITIAL_STATE: NotesDrawerState = {
  isOpen: false,
  request: null,
};

/**
 * Manages Notes drawer visibility and the active editor request.
 */
export function useNotesDrawer(): UseNotesDrawerResult {
  const [state, setState] = useState<NotesDrawerState>(INITIAL_STATE);

  const openEdit = useCallback((noteId: string) => {
    setState({
      isOpen: true,
      request: { mode: "edit", noteId },
    });
  }, []);

  const openCreateForDate = useCallback((date: string) => {
    setState({
      isOpen: true,
      request: { mode: "create", date },
    });
  }, []);

  const openCreateGeneral = useCallback(() => {
    setState({
      isOpen: true,
      request: { mode: "create", general: true },
    });
  }, []);

  const close = useCallback(() => {
    setState((previous) => ({ ...previous, isOpen: false }));
  }, []);

  const setOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
      }
    },
    [close],
  );

  return {
    isOpen: state.isOpen,
    request: state.request,
    openEdit,
    openCreateForDate,
    openCreateGeneral,
    close,
    setOpen,
  };
}
