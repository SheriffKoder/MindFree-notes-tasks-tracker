/**
 * @file features/activity/activity-page/model/use-activity-records-drawer.ts
 * Selected-day records drawer UI state — open/close and the active date.
 *
 * Presentation-only: does not fetch or mutate records. The page owns this hook
 * so calendar clicks can coordinate the definition and records drawers.
 */

"use client";

import { useCallback, useState } from "react";

import type { ActivityRecordDrawerController } from "@/features/activity/activity-record-drawer/model/types";

export interface ActivityRecordsDrawerState {
  isOpen: boolean;
  /** Selected calendar day (`YYYY-MM-DD`), retained while the drawer is closed. */
  selectedDate: string | null;
}

export type UseActivityRecordsDrawerResult = ActivityRecordDrawerController;

const INITIAL_STATE: ActivityRecordsDrawerState = {
  isOpen: false,
  selectedDate: null,
};

/**
 * Manages selected-day records drawer visibility and active date.
 */
export function useActivityRecordsDrawer(): UseActivityRecordsDrawerResult {
  const [state, setState] =
    useState<ActivityRecordsDrawerState>(INITIAL_STATE);

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
