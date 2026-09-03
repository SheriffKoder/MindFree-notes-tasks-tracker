/**
 * @file views/notes/model/editor/use-note-categories-drawer.ts
 * Category manage-drawer UI state — open/close only.
 *
 * Purpose: Page-owned visibility for the category manager; no fetch or mutations.
 * Used in: views/notes/ui/notes-client.tsx
 * Used for: Settings control + NoteCategoryDrawer wiring.
 *
 * Steps:
 * 1. Track isOpen
 * 2. Expose open / close / setOpen for AppDrawer
 */

"use client";

import { useCallback, useState } from "react";

export interface UseNoteCategoriesDrawerResult {
  isOpen: boolean;
  /** Opens the category manage drawer. */
  open: () => void;
  /** Closes the drawer. */
  close: () => void;
  /** Maps to `AppDrawer` `onOpenChange` — closes when `open === false`. */
  setOpen: (open: boolean) => void;
}

/**
 * Manages Notes category-manager drawer visibility.
 */
export function useNoteCategoriesDrawer(): UseNoteCategoriesDrawerResult {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return {
    isOpen,
    open,
    close,
    setOpen,
  };
}
