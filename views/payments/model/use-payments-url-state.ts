/**
 * @file views/payments/model/use-payments-url-state.ts
 * Payments page URL state — reads `month` and mutates via the router.
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { parseMonthParam } from "@/entities/payment";
import { useMonthNavigation } from "@/shared/month-navigator";

export interface UsePaymentsUrlStateResult {
  month: string;
  /** Navigates to an explicit month key, preserving other search params. */
  navigateToMonth: (nextMonth: string) => void;
  /** Moves to the previous month via the URL. */
  previousMonth: () => void;
  /** Moves to the next month via the URL. */
  nextMonth: () => void;
}

/**
 * Resolves Payments page URL month state and navigation actions.
 */
export function usePaymentsUrlState(): UsePaymentsUrlStateResult {
  const searchParams = useSearchParams();

  const month = useMemo(
    () => parseMonthParam(searchParams.get("month")),
    [searchParams],
  );

  const { navigateToMonth, onPrevious, onNext } = useMonthNavigation(month);

  return {
    month,
    navigateToMonth,
    previousMonth: onPrevious,
    nextMonth: onNext,
  };
}
