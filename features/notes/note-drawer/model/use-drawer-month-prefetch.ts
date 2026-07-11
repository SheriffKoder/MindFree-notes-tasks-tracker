/**
 * @file features/notes/note-drawer/model/use-drawer-month-prefetch.ts
 * Warms adjacent month caches when drawer navigation nears a month edge.
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMonthRange } from "@/entities/note/lib/parse-month";
import {
  calendarNotesQueryOptions,
  prefetchAdjacentCalendarMonths,
} from "@/entities/note/client";
import { monthOfIsoDate } from "@/features/notes/note-drawer/lib/month-of-iso-date";

/**
 * Prefetches ±1 months when `activeDate` is the first or last day of its month.
 */
export function useDrawerMonthPrefetch(
  activeDate: string | null,
  isDateNavEnabled: boolean,
): void {
  const queryClient = useQueryClient();
  const activeMonth =
    isDateNavEnabled && activeDate ? monthOfIsoDate(activeDate) : null;

  const { isSuccess } = useQuery({
    ...calendarNotesQueryOptions(activeMonth ?? ""),
    enabled: Boolean(activeMonth),
  });

  useEffect(() => {
    if (!isDateNavEnabled || !activeDate || !activeMonth || !isSuccess) {
      return;
    }

    const dayNumber = Number(activeDate.slice(8, 10));
    const { daysInMonth } = getMonthRange(activeMonth);

    if (dayNumber === 1 || dayNumber === daysInMonth) {
      void prefetchAdjacentCalendarMonths(queryClient, activeMonth);
    }
  }, [activeDate, activeMonth, isDateNavEnabled, isSuccess, queryClient]);
}
