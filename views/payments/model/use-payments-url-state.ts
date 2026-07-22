/**
 * @file views/payments/model/use-payments-url-state.ts
 * Payments page URL state — reads `month` and mutates via the router.
 *
 * Purpose: Derive active month from search params and expose navigation actions.
 * Used in: views/payments/ui/payments-client.tsx
 * Used for: Month navigator previous/next and preserving other URL params.
 *
 * Steps:
 * 1. Parse `?month=` from search params (default current month).
 * 2. Delegate prev/next navigation to shared useMonthNavigation.
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

  /////////////////////////////////
  // 1. Month — normalize URL param to YYYY-MM
  const month = useMemo(
    () => parseMonthParam(searchParams.get("month")),
    [searchParams],
  );

  /////////////////////////////////
  // 2. Navigation — shared month prev/next helpers
  const { navigateToMonth, onPrevious, onNext } = useMonthNavigation(month);

  return {
    month,
    navigateToMonth,
    previousMonth: onPrevious,
    nextMonth: onNext,
  };
}
