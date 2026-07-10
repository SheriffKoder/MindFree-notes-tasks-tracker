/**
 * @file views/notes/model/use-prefetch-adjacent-calendar-months.ts
 * Warms ±1 month calendar caches after the active month has loaded.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { prefetchAdjacentCalendarMonths } from "@/entities/note/client";

/**
 * Prefetches previous and next month once the active month's calendar query succeeds.
 */
export function usePrefetchAdjacentCalendarMonths(
  month: string,
  isCalendarReady: boolean,
): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isCalendarReady) {
      return;
    }

    void prefetchAdjacentCalendarMonths(queryClient, month);
  }, [isCalendarReady, month, queryClient]);
}
