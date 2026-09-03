/**
 * @file features/notes/note-category-drawer/model/use-note-category-drawer-state.ts
 * Local UI state for the category manage drawer (selected panel + feedback).
 *
 * Purpose: Keep list/form/confirm selection in the feature, not the page.
 * Used in: features/notes/note-category-drawer/ui/note-category-drawer.tsx
 * Used for: Create/edit form, hard-delete confirm, and error banner.
 *
 * Steps:
 * 1. Track which panel is showing (list, create, edit, hard-delete)
 * 2. Reset when the drawer closes
 * 3. Surface a single inline error string for mutation failures
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import type { NoteCategory } from "@/entities/note/client";

export type NoteCategoryDrawerPanel =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; categoryId: string }
  | { kind: "hard-delete"; category: NoteCategory };

export interface UseNoteCategoryDrawerStateResult {
  panel: NoteCategoryDrawerPanel;
  feedback: string | null;
  openCreate: () => void;
  openEdit: (categoryId: string) => void;
  openHardDelete: (category: NoteCategory) => void;
  showList: () => void;
  setFeedback: (message: string | null) => void;
}

/**
 * Owns manage-drawer panel selection and inline error copy.
 *
 * @param isOpen - when false, panel and feedback reset to the list
 */
export function useNoteCategoryDrawerState(
  isOpen: boolean,
): UseNoteCategoryDrawerStateResult {
  const [panel, setPanel] = useState<NoteCategoryDrawerPanel>({ kind: "list" });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(
    function resetCategoryDrawerPanelWhenClosed() {
      if (isOpen) {
        return;
      }

      setPanel({ kind: "list" });
      setFeedback(null);
    },
    [isOpen],
  );

  const openCreate = useCallback(() => {
    setFeedback(null);
    setPanel({ kind: "create" });
  }, []);

  const openEdit = useCallback((categoryId: string) => {
    setFeedback(null);
    setPanel({ kind: "edit", categoryId });
  }, []);

  const openHardDelete = useCallback((category: NoteCategory) => {
    setFeedback(null);
    setPanel({ kind: "hard-delete", category });
  }, []);

  const showList = useCallback(() => {
    setFeedback(null);
    setPanel({ kind: "list" });
  }, []);

  return {
    panel,
    feedback,
    openCreate,
    openEdit,
    openHardDelete,
    showList,
    setFeedback,
  };
}
