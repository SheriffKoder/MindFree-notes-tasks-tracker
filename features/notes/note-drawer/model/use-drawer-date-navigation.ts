/**
 * @file features/notes/note-drawer/model/use-drawer-date-navigation.ts
 * Previous/next day navigation and optional horizontal swipe in the drawer.
 */

"use client";

import { useCallback, useMemo, useRef } from "react";
import type { PointerEventHandler } from "react";

import { shiftIsoDate } from "@/features/notes/note-drawer/lib/shift-iso-date";

const SWIPE_THRESHOLD_PX = 50;

export interface UseDrawerDateNavigationOptions {
  activeDate: string | null;
  isDateNavEnabled: boolean;
  setActiveDate: (date: string) => void;
}

export interface DrawerDateSwipeHandlers {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
}

export interface UseDrawerDateNavigationResult {
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  swipeHandlers: DrawerDateSwipeHandlers | null;
}

/**
 * Moves the drawer across calendar days without touching page URL state.
 */
export function useDrawerDateNavigation({
  activeDate,
  isDateNavEnabled,
  setActiveDate,
}: UseDrawerDateNavigationOptions): UseDrawerDateNavigationResult {
  const pointerStartX = useRef<number | null>(null);

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

  const swipeHandlers = useMemo<DrawerDateSwipeHandlers | null>(() => {
    if (!isDateNavEnabled) {
      return null;
    }

    return {
      onPointerDown: (event) => {
        pointerStartX.current = event.clientX;
      },
      onPointerUp: (event) => {
        if (pointerStartX.current === null) {
          return;
        }

        const deltaX = event.clientX - pointerStartX.current;
        pointerStartX.current = null;

        if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
          return;
        }

        if (deltaX < 0) {
          goToNextDay();
          return;
        }

        goToPreviousDay();
      },
      onPointerCancel: () => {
        pointerStartX.current = null;
      },
    };
  }, [goToNextDay, goToPreviousDay, isDateNavEnabled]);

  return {
    goToPreviousDay,
    goToNextDay,
    swipeHandlers,
  };
}
