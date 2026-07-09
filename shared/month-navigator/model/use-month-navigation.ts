/**
 * @file shared/month-navigator/model/use-month-navigation.ts
 * URL-driven month navigation for pages that sync `?month=` to the router.
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { shiftMonth } from "@/shared/month-navigator/lib/month-key";

/**
 * Options for {@link useMonthNavigation}.
 */
export interface UseMonthNavigationOptions {
  /** Search param key for the month (default: `month`). */
  paramName?: string;
}

/**
 * Result of {@link useMonthNavigation}.
 */
export interface UseMonthNavigationResult {
  /** Navigates to an explicit month key, preserving other search params. */
  navigateToMonth: (nextMonth: string) => void;
  /** Moves to the previous month via the URL. */
  onPrevious: () => void;
  /** Moves to the next month via the URL. */
  onNext: () => void;
}

/**
 * Wires month prev/next navigation to the current route's search params.
 *
 * @param month - current resolved month key (`YYYY-MM`)
 * @param options - optional search param configuration
 * @returns navigation callbacks for {@link MonthNavigator}
 */
export function useMonthNavigation(
  month: string,
  options: UseMonthNavigationOptions = {},
): UseMonthNavigationResult {
  const { paramName = "month" } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateToMonth = useCallback(
    (nextMonth: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, nextMonth);
      router.push(`${pathname}?${params.toString()}`);
    },
    [paramName, pathname, router, searchParams],
  );

  const onPrevious = useCallback(() => {
    navigateToMonth(shiftMonth(month, -1));
  }, [month, navigateToMonth]);

  const onNext = useCallback(() => {
    navigateToMonth(shiftMonth(month, 1));
  }, [month, navigateToMonth]);

  return {
    navigateToMonth,
    onPrevious,
    onNext,
  };
}
