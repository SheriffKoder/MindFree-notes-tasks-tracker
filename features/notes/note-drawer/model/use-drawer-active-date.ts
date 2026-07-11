/**
 * @file features/notes/note-drawer/model/use-drawer-active-date.ts
 * Drawer navigation date — source of truth for calendar-note editor mode.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { findNoteByIdInCache } from "@/features/notes/note-drawer/lib/find-note-in-cache";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

export interface UseDrawerActiveDateResult {
  /** Active ISO date while browsing calendar notes in the drawer. */
  activeDate: string | null;
  /** Whether prev/next controls and swipe are enabled. */
  isDateNavEnabled: boolean;
  /** Updates `activeDate` from drawer day navigation only. */
  setActiveDate: (date: string) => void;
}

/**
 * Derives drawer date-navigation state from the open editor request.
 *
 * `activeDate` resets when the drawer opens with a new request and is updated
 * only by drawer navigation — not by page URL or calendar highlight state.
 */
export function useDrawerActiveDate(
  request: NoteEditorRequest | null,
  isOpen: boolean,
): UseDrawerActiveDateResult {
  const queryClient = useQueryClient();
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const isDateNavEnabled = useMemo(() => {
    if (!isOpen || !request) {
      return false;
    }

    if (request.mode === "create" && "general" in request) {
      return false;
    }

    if (request.mode === "create" && "date" in request) {
      return true;
    }

    if (request.mode === "edit") {
      const note = findNoteByIdInCache(queryClient, request.noteId);
      return Boolean(note?.date);
    }

    return false;
  }, [isOpen, queryClient, request]);

  useEffect(() => {
    if (!isOpen || !request) {
      setActiveDate(null);
      return;
    }

    if (request.mode === "create" && "date" in request) {
      setActiveDate(request.date);
      return;
    }

    if (request.mode === "edit") {
      const note = findNoteByIdInCache(queryClient, request.noteId);
      setActiveDate(note?.date ?? null);
      return;
    }

    setActiveDate(null);
  }, [isOpen, queryClient, request]);

  return {
    activeDate,
    isDateNavEnabled,
    setActiveDate,
  };
}
