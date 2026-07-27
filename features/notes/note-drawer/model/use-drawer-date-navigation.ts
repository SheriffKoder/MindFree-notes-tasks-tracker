/**
 * @file features/notes/note-drawer/model/use-drawer-date-navigation.ts
 * Previous/next day navigation in the drawer (footer buttons).
 */

"use client";

import { useCallback } from "react";

import { shiftIsoDate } from "@/features/notes/note-drawer/lib/shift-iso-date";

export interface UseDrawerDateNavigationOptions {
  activeDate: string | null;
  isDateNavEnabled: boolean;
  setActiveDate: (date: string) => void;
}

export interface UseDrawerDateNavigationResult {
  goToPreviousDay: () => void;
  goToNextDay: () => void;
}

/**
 * Moves the drawer across calendar days without touching page URL state.
 */
export function useDrawerDateNavigation({
  activeDate,
  isDateNavEnabled,
  setActiveDate,
}: UseDrawerDateNavigationOptions): UseDrawerDateNavigationResult {
  const goToPreviousDay = useCallback(() => {
    if (!activeDate || !isDateNavEnabled) {
      return;
    }

    setActiveDate(shiftIsoDate(activeDate, -1));
  }, [activeDate, isDateNavEnabled, setActiveDate]);

  const goToNextDay = useCallback(() => {
    if (!activeDate || !isDateNavEnabled) {
      return;
    }

    setActiveDate(shiftIsoDate(activeDate, 1));
  }, [activeDate, isDateNavEnabled, setActiveDate]);

  return {
    goToPreviousDay,
    goToNextDay,
  };
}
