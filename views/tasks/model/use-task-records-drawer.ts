/**
 * @file views/tasks/model/use-task-records-drawer.ts
 * Selected-day records drawer UI state — open/close and the active date.
 *
 * Presentation-only: does not fetch or mutate records. Mirrors Notes' day-click
 * drawer ownership (`useNotesDrawer` + `selectDate`) for the Tasks calendar.
 */

"use client";

import { useCallback, useState } from "react";

export interface TaskRecordsDrawerState {
  isOpen: boolean;
  /** Selected calendar day (`YYYY-MM-DD`), retained while the drawer is closed. */
  selectedDate: string | null;
}

export interface UseTaskRecordsDrawerResult {
  isOpen: boolean;
  selectedDate: string | null;
  /** Opens the records drawer for a calendar day. */
  openForDate: (date: string) => void;
  /** Closes the drawer without clearing the last selected date. */
  close: () => void;
  /** Maps to `AppDrawer` `onOpenChange` — closes when `open === false`. */
  setOpen: (open: boolean) => void;
}

const INITIAL_STATE: TaskRecordsDrawerState = {
  isOpen: false,
  selectedDate: null,
};

/**
 * Manages Tasks selected-day records drawer visibility and active date.
 */
export function useTaskRecordsDrawer(): UseTaskRecordsDrawerResult {
  const [state, setState] = useState<TaskRecordsDrawerState>(INITIAL_STATE);

  const openForDate = useCallback((date: string) => {
    setState({
      isOpen: true,
      selectedDate: date,
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
    selectedDate: state.selectedDate,
    openForDate,
    close,
    setOpen,
  };
}
